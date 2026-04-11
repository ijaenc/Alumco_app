import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { ArrowLeft, Clock, AlertCircle, Loader2, Ban } from "lucide-react";
import { evaluationService, type EvaluationFull } from "../services/evaluationService";
import { toast } from "sonner";

export default function Evaluation() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [evaluation, setEvaluation] = useState<EvaluationFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const startedAt = useRef(new Date().toISOString());

  useEffect(() => {
    if (!id) return;
    evaluationService.getById(id)
      .then((data) => {
        setEvaluation(data);
        setTimeRemaining((data.time_limit_min || 30) * 60);
      })
      .catch((err) => {
        toast.error(err.message || "Error cargando la evaluación");
        navigate(-1);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0 || !evaluation) return;
    const timer = setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) { handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [evaluation]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handleSubmit = async () => {
    if (!evaluation || !id) return;
    setSubmitting(true);
    try {
      const result = await evaluationService.submit(id, answers, startedAt.current);
      navigate(`/results/${id}`, { state: { result } });
    } catch (err: any) {
      toast.error(err.message || "Error al enviar la evaluación");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!evaluation) return null;

  const { attemptInfo } = evaluation;

  // Blocked state
  if (attemptInfo && !attemptInfo.canAttempt) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <Ban className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Evaluación no disponible</h2>
          <p className="text-gray-600 mb-2">{attemptInfo.message}</p>
          {attemptInfo.unlockDate && (
            <p className="text-sm text-gray-500 mb-6">
              Disponible el {new Date(attemptInfo.unlockDate).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
          <Button onClick={() => navigate(-1)} variant="outline" className="w-full">Volver</Button>
        </Card>
      </div>
    );
  }

  const questions = evaluation.questions;
  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const hasAnswer = Boolean(answers[currentQ?.id]);
  const allAnswered = questions.every((q) => answers[q.id]);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900">Evaluación Final</h2>
              <p className="text-xs text-gray-500">{evaluation.course_title}</p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${timeRemaining < 300 ? "bg-red-50" : "bg-blue-50"}`}>
              <Clock className={`w-4 h-4 ${timeRemaining < 300 ? "text-red-500" : "text-primary"}`} />
              <span className={`text-sm font-medium ${timeRemaining < 300 ? "text-red-600" : "text-primary"}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Progreso</span>
              <span>{currentQuestion + 1} de {questions.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4">
        {attemptInfo && attemptInfo.attemptsRemaining < 2 && !attemptInfo.alreadyPassed && (
          <Card className="p-4 mb-4 bg-yellow-50 border-yellow-200">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                {attemptInfo.attemptsRemaining === 1 ? "⚠️ ¡Este es tu último intento!" : `Te quedan ${attemptInfo.attemptsRemaining} intentos.`}
              </p>
            </div>
          </Card>
        )}

        <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">Lee cada pregunta y selecciona la mejor respuesta. Puedes navegar antes de enviar.</p>
          </div>
        </Card>

        {currentQ && (
          <Card className="p-6 mb-4">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-primary rounded-lg mb-4">
              <span className="text-white font-semibold text-sm">{currentQuestion + 1}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6 leading-relaxed">{currentQ.text}</h3>
            <RadioGroup
              value={answers[currentQ.id] || ""}
              onValueChange={(val) => setAnswers({ ...answers, [currentQ.id]: val })}
            >
              <div className="space-y-3">
                {currentQ.options.map((opt) => (
                  <div
                    key={opt.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      answers[currentQ.id] === opt.id ? "border-primary bg-blue-50" : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                    onClick={() => setAnswers({ ...answers, [currentQ.id]: opt.id })}
                  >
                    <RadioGroupItem value={opt.id} id={`opt-${opt.id}`} className="mt-0.5" />
                    <Label htmlFor={`opt-${opt.id}`} className="flex-1 cursor-pointer font-normal text-gray-700">
                      {opt.text}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </Card>
        )}

        {/* Question navigator */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestion(i)}
              className={`h-10 rounded-lg font-medium text-sm transition-colors ${
                i === currentQuestion ? "bg-primary text-white"
                : answers[q.id] ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-gray-100 text-gray-600 border border-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="flex gap-3 pb-6">
          <Button variant="outline" className="flex-1 h-12" onClick={() => setCurrentQuestion((q) => q - 1)} disabled={currentQuestion === 0}>
            Anterior
          </Button>
          {currentQuestion < questions.length - 1 ? (
            <Button className="flex-1 h-12 bg-primary" onClick={() => setCurrentQuestion((q) => q + 1)} disabled={!hasAnswer}>
              Siguiente
            </Button>
          ) : (
            <Button
              className="flex-1 h-12 bg-green-600 hover:bg-green-700"
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Finalizar"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
