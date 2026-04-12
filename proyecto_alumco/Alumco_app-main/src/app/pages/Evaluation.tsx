import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { ArrowLeft, Clock, AlertCircle, Loader2, Ban, AlertTriangle } from "lucide-react";
import { evaluationService, type EvaluationFull, type AttemptInfo } from "../services/evaluationService";
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
  const [tabWarnings, setTabWarnings] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);

  const startedAt = useRef(new Date().toISOString());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submittedRef = useRef(false); // evitar doble envío

  // ── Cargar evaluación ────────────────────────────────────────────────────
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

  // ── Enviar evaluación ────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (timedOut = false) => {
    if (!evaluation || !id || submittedRef.current) return;
    submittedRef.current = true;

    // Detener timer
    if (timerRef.current) clearInterval(timerRef.current);

    setSubmitting(true);
    try {
      const result = await evaluationService.submit(id, answers, startedAt.current);
      // Si fue por tiempo agotado, mostrar mensaje especial
      if (timedOut) {
        toast.warning("¡Tiempo agotado! La evaluación fue enviada automáticamente.");
      }
      navigate(`/results/${id}`, { state: { result } });
    } catch (err: any) {
      toast.error(err.message || "Error al enviar la evaluación");
      submittedRef.current = false;
      setSubmitting(false);
    }
  }, [evaluation, id, answers]);

  // ── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!evaluation || timeRemaining <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          // Enviar automáticamente con lo que tenga respondido
          handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [evaluation]);

  // ── Bloquear salida de pestaña ───────────────────────────────────────────
  useEffect(() => {
    if (!evaluation || submittedRef.current) return;

    // Advertencia al cerrar/recargar la página
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (submittedRef.current) return;
      e.preventDefault();
      e.returnValue = "¿Seguro que quieres salir? Perderás tu progreso en la evaluación.";
      return e.returnValue;
    };

    // Detectar cambio de pestaña / ventana en segundo plano
    const handleVisibilityChange = () => {
      if (document.hidden && !submittedRef.current) {
        setTabWarnings((prev) => {
          const next = prev + 1;
          setShowTabWarning(true);
          if (next >= 3) {
            // 3 salidas = enviar automáticamente
            toast.error("Saliste de la evaluación demasiadas veces. La evaluación fue enviada.");
            handleSubmit(false);
          } else {
            toast.warning(`⚠️ Advertencia ${next}/3: No salgas de la evaluación.`);
          }
          return next;
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [evaluation, handleSubmit]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  // ── Estados de carga y bloqueo ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!evaluation) return null;

  const { attemptInfo } = evaluation;

  if (attemptInfo && !attemptInfo.canAttempt) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <Ban className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Evaluación no disponible</h2>
          <p className="text-gray-600 mb-2">{attemptInfo.message}</p>
          {attemptInfo.unlockDate && (
            <p className="text-sm text-gray-500 mb-6">
              Disponible el{" "}
              {new Date(attemptInfo.unlockDate).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
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
  const isLastQuestion = currentQuestion === questions.length - 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            {/* Sin botón de volver — evaluación en curso */}
            <div className="w-9 h-9" /> {/* spacer */}
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

        {/* Advertencia de cambio de pestaña */}
        {showTabWarning && tabWarnings > 0 && tabWarnings < 3 && (
          <Card className="p-4 mb-4 bg-orange-50 border-orange-300">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-orange-900">
                  ⚠️ Advertencia {tabWarnings}/3 — No salgas de la evaluación
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  Si sales {3 - tabWarnings} vez{3 - tabWarnings !== 1 ? "es" : ""} más, la evaluación se enviará automáticamente.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Aviso de último intento */}
        {attemptInfo && attemptInfo.attemptsRemaining <= 1 && !attemptInfo.alreadyPassed && (
          <Card className="p-4 mb-4 bg-yellow-50 border-yellow-200">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                {attemptInfo.attemptsRemaining === 1
                  ? "⚠️ ¡Este es tu último intento!"
                  : `Te quedan ${attemptInfo.attemptsRemaining} intentos.`}
              </p>
            </div>
          </Card>
        )}

        {/* Instrucciones */}
        <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Instrucciones</p>
              <p className="text-xs text-blue-700 mt-1">
                Lee cada pregunta y selecciona la mejor respuesta. No salgas de esta página — 
                si cambias de pestaña 3 veces, la evaluación se enviará automáticamente.
              </p>
            </div>
          </div>
        </Card>

        {/* Pregunta actual */}
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
                      answers[currentQ.id] === opt.id
                        ? "border-primary bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
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

        {/* Navegador de preguntas */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestion(i)}
              className={`h-10 rounded-lg font-medium text-sm transition-colors ${
                i === currentQuestion
                  ? "bg-primary text-white"
                  : answers[q.id]
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-gray-100 text-gray-600 border border-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Botones de navegación */}
        <div className="flex gap-3 pb-6">
          <Button
            variant="outline"
            className="flex-1 h-12"
            onClick={() => setCurrentQuestion((q) => q - 1)}
            disabled={currentQuestion === 0}
          >
            Anterior
          </Button>
          {!isLastQuestion ? (
            <Button
              className="flex-1 h-12 bg-primary"
              onClick={() => setCurrentQuestion((q) => q + 1)}
              disabled={!hasAnswer}
            >
              Siguiente
            </Button>
          ) : (
            <Button
              className="flex-1 h-12 bg-green-600 hover:bg-green-700"
              onClick={() => handleSubmit(false)}
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
