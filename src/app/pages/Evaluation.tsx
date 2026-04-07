import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { ArrowLeft, Clock, AlertCircle } from "lucide-react";
import { canAttemptEvaluation } from "../services/attemptService";

const questions = [
  {
    id: 1,
    question: "¿Qué documento establece los derechos humanos fundamentales a nivel internacional?",
    options: [
      "La Constitución de las Naciones Unidas",
      "La Declaración Universal de los Derechos Humanos",
      "El Tratado de Ginebra",
      "La Carta de los Derechos Civiles",
    ],
    correctAnswer: 1,
  },
  {
    id: 2,
    question: "¿En qué año fue adoptada la Declaración Universal de los Derechos Humanos?",
    options: ["1945", "1948", "1950", "1960"],
    correctAnswer: 1,
  },
  {
    id: 3,
    question: "¿Cuál de los siguientes NO es un derecho humano fundamental?",
    options: [
      "Derecho a la vida",
      "Derecho a la educación",
      "Derecho al lujo",
      "Derecho a la libertad de expresión",
    ],
    correctAnswer: 2,
  },
  {
    id: 4,
    question: "¿Qué organismo internacional supervisa el cumplimiento de los derechos humanos?",
    options: [
      "La Organización Mundial de la Salud",
      "El Consejo de Seguridad de la ONU",
      "La Corte Internacional de Justicia",
      "El Consejo de Derechos Humanos de la ONU",
    ],
    correctAnswer: 3,
  },
  {
    id: 5,
    question: "¿Cuál es el principio fundamental de los derechos humanos?",
    options: [
      "La reciprocidad",
      "La universalidad",
      "La especialización",
      "La regionalización",
    ],
    correctAnswer: 1,
  },
];

export default function Evaluation() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes in seconds
  
  // Check attempt status
  const attemptStatus = canAttemptEvaluation(id || "1");

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const hasAnswer = answers[currentQuestion] !== undefined;

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers({ ...answers, [currentQuestion]: optionIndex });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    // Calculate score
    let correctAnswers = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correctAnswers++;
      }
    });
    const score = Math.round((correctAnswers / questions.length) * 100);
    navigate(`/results/${id}?score=${score}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/training/${id}`)}
              className="text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900">Evaluación Final</h2>
              <p className="text-xs text-gray-500">
                Derechos Humanos Fundamentales
              </p>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Progreso</span>
              <span>
                {currentQuestion + 1} de {questions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4">
        {/* Attempts Warning */}
        {attemptStatus.attemptsRemaining < 2 && (
          <Card className="p-4 mb-6 bg-yellow-50 border-yellow-200">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-900 font-medium">
                  {attemptStatus.attemptsRemaining === 1
                    ? "¡Último intento!"
                    : "Advertencia importante"}
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  {attemptStatus.attemptsRemaining === 1
                    ? "Este es tu último intento. Si no apruebas, deberás esperar 2 semanas para volver a intentarlo."
                    : "Recuerda que solo tienes 2 intentos para aprobar esta evaluación."}
                </p>
              </div>
            </div>
          </Card>
        )}
        
        {/* Alert */}
        <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-900 font-medium">
                Instrucciones
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Lee cada pregunta cuidadosamente y selecciona la mejor respuesta.
                Puedes navegar entre preguntas antes de enviar.
              </p>
            </div>
          </div>
        </Card>

        {/* Question Card */}
        <Card className="p-6 mb-6">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-primary rounded-lg mb-4">
              <span className="text-white font-semibold text-sm">
                {currentQuestion + 1}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
              {currentQ.question}
            </h3>
          </div>

          <RadioGroup
            value={answers[currentQuestion]?.toString()}
            onValueChange={(value) => handleAnswerSelect(parseInt(value))}
          >
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <div key={index}>
                  <div
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      answers[currentQuestion] === index
                        ? "border-primary bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <RadioGroupItem
                      value={index.toString()}
                      id={`option-${index}`}
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer font-normal text-gray-700"
                    >
                      {option}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </Card>

        {/* Question Navigation */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`h-10 rounded-lg font-medium text-sm transition-colors ${
                index === currentQuestion
                  ? "bg-primary text-white"
                  : answers[index] !== undefined
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-gray-100 text-gray-600 border border-gray-200"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 pb-6">
          <Button
            variant="outline"
            className="flex-1 h-12"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Anterior
          </Button>
          {currentQuestion < questions.length - 1 ? (
            <Button
              className="flex-1 h-12 bg-primary hover:bg-blue-600"
              onClick={handleNext}
              disabled={!hasAnswer}
            >
              Siguiente
            </Button>
          ) : (
            <Button
              className="flex-1 h-12 bg-green-600 hover:bg-green-700"
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== questions.length}
            >
              Finalizar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}