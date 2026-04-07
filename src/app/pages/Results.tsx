import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { useNavigate, useParams, useSearchParams } from "react-router";
import {
  AlertCircle,
  Award,
  Calendar,
  CheckCircle2,
  Download,
  Home,
  RefreshCcw,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { recordAttempt, canAttemptEvaluation } from "../services/attemptService";
import { addCertificate, getCertificateByTrainingId, downloadCertificate } from "../services/certificateService";
import { toast } from "sonner";

export default function Results() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const score = parseInt(searchParams.get("score") || "0");
  const [showConfetti, setShowConfetti] = useState(false);
  const [attemptStatus, setAttemptStatus] = useState(
    canAttemptEvaluation(id || "1")
  );
  const [certificate, setCertificate] = useState<any>(null);

  const isPassed = score >= 70;
  const totalQuestions = 5;
  const correctAnswers = Math.round((score / 100) * totalQuestions);

  const handleDownloadCertificate = () => {
    if (certificate) {
      const success = downloadCertificate(certificate.id);
      if (success) {
        toast.success("Certificado descargado exitosamente", {
          description: `Certificado ${certificate.certificateNumber}`,
        });
      }
    }
  };

  useEffect(() => {
    // Record this attempt
    recordAttempt(id || "1", score, isPassed);
    
    // Update attempt status
    setAttemptStatus(canAttemptEvaluation(id || "1"));
    
    // Generate certificate if passed
    if (isPassed) {
      let existingCert = getCertificateByTrainingId(id || "1");
      if (!existingCert) {
        existingCert = addCertificate(
          id || "1",
          "Derechos Humanos Fundamentales",
          score,
          "Dr. Juan Pérez"
        );
      }
      setCertificate(existingCert);
    }
    
    if (isPassed && !showConfetti) {
      setShowConfetti(true);
      // Trigger confetti animation
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = ["#3B82F6", "#10B981", "#F59E0B"];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [isPassed, showConfetti, id]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Result Card */}
        <Card
          className={`p-8 text-center mb-6 ${
            isPassed
              ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
              : "bg-gradient-to-br from-red-50 to-orange-50 border-red-200"
          }`}
        >
          <div
            className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isPassed ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {isPassed ? (
              <CheckCircle2 className="w-10 h-10 text-white" />
            ) : (
              <XCircle className="w-10 h-10 text-white" />
            )}
          </div>

          <h1
            className={`text-3xl font-bold mb-2 ${
              isPassed ? "text-green-900" : "text-red-900"
            }`}
          >
            {isPassed ? "¡Aprobado!" : "No Aprobado"}
          </h1>
          <p
            className={`text-sm mb-6 ${
              isPassed ? "text-green-700" : "text-red-700"
            }`}
          >
            {isPassed
              ? "¡Felicitaciones! Has completado exitosamente la evaluación"
              : "No alcanzaste el puntaje mínimo requerido (70%)"}
          </p>

          <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
            <div className="text-6xl font-bold text-gray-900 mb-2">
              {score}
              <span className="text-3xl text-gray-500">%</span>
            </div>
            <p className="text-sm text-gray-600">Puntaje obtenido</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {correctAnswers}
                </span>
              </div>
              <p className="text-xs text-gray-600">Correctas</p>
            </div>
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {totalQuestions - correctAnswers}
                </span>
              </div>
              <p className="text-xs text-gray-600">Incorrectas</p>
            </div>
          </div>
        </Card>

        {/* Course Info */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Detalles del Curso
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Award className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">
                Derechos Humanos Fundamentales
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">
                {new Date().toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <TrendingUp className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">
                Puntaje mínimo requerido: 70%
              </span>
            </div>
          </div>
        </Card>

        {/* Certificate Section - Only if passed */}
        {isPassed && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  Certificado Disponible
                </h3>
                <p className="text-sm text-gray-600">
                  Ya puedes descargar tu certificado
                </p>
              </div>
            </div>
            <Button className="w-full h-12 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white" onClick={handleDownloadCertificate}>
              <Download className="w-5 h-5 mr-2" />
              Descargar Certificado
            </Button>
          </Card>
        )}

        {/* Retry Section - Only if failed */}
        {!isPassed && (
          <>
            {/* Attempts Remaining Warning */}
            {!attemptStatus.canAttempt && (
              <Card className="p-6 mb-6 bg-red-50 border-red-200">
                <div className="flex gap-3 mb-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-1">
                      Has agotado tus intentos
                    </h3>
                    <p className="text-sm text-red-700">
                      {attemptStatus.message}
                    </p>
                    {attemptStatus.unlockDate && (
                      <p className="text-sm text-red-700 mt-2 font-medium">
                        Podrás volver a intentarlo el{" "}
                        {attemptStatus.unlockDate.toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )}
            
            {/* Attempts Remaining Info */}
            {attemptStatus.canAttempt && attemptStatus.attemptsRemaining > 0 && (
              <Card className="p-6 mb-6 bg-yellow-50 border-yellow-200">
                <div className="flex gap-3 mb-3">
                  <RefreshCcw className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-1">
                      {attemptStatus.attemptsRemaining === 1
                        ? "Te queda 1 intento"
                        : `Te quedan ${attemptStatus.attemptsRemaining} intentos`}
                    </h3>
                    <p className="text-sm text-yellow-700">
                      {attemptStatus.attemptsRemaining === 1
                        ? "Este es tu último intento. Si no apruebas, deberás esperar 2 semanas para volver a intentarlo."
                        : "Recuerda que solo tienes 2 intentos. Si fallas ambos, deberás esperar 2 semanas."}
                    </p>
                  </div>
                </div>
              </Card>
            )}
            
            <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Qué puedes hacer?
              </h3>
              <ul className="text-sm text-gray-700 space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Revisa nuevamente el material del curso</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Consulta los recursos adicionales disponibles</span>
                </li>
                {attemptStatus.canAttempt && (
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Intenta la evaluación nuevamente</span>
                  </li>
                )}
              </ul>
            </Card>
          </>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isPassed && attemptStatus.canAttempt && (
            <Button
              className="w-full h-12 bg-primary hover:bg-blue-600 text-white"
              onClick={() => navigate(`/evaluation/${id}`)}
            >
              <RefreshCcw className="w-5 h-5 mr-2" />
              Intentar Nuevamente
            </Button>
          )}
          {!isPassed && !attemptStatus.canAttempt && (
            <Button
              className="w-full h-12 bg-gray-300 text-gray-500 cursor-not-allowed"
              disabled
            >
              <AlertCircle className="w-5 h-5 mr-2" />
              Intentos agotados
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full h-12 border-gray-300"
            onClick={() => navigate("/dashboard")}
          >
            <Home className="w-5 h-5 mr-2" />
            Volver al Dashboard
          </Button>
        </div>

        {/* Footer Message */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            {isPassed
              ? "Continúa aprendiendo y mejorando tus habilidades"
              : "¡No te desanimes! Sigue practicando y lo lograrás"}
          </p>
        </div>
      </div>
    </div>
  );
}
