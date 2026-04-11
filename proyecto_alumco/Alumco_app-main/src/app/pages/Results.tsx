import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { useNavigate, useParams, useLocation } from "react-router";
import { AlertCircle, Award, Calendar, CheckCircle2, Download, Home, RefreshCcw, TrendingUp, XCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { toast } from "sonner";
import type { SubmitResult } from "../services/evaluationService";

export default function Results() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const result: SubmitResult = location.state?.result;

  const [confettiFired, setConfettiFired] = useState(false);

  // If no result state (direct URL access), redirect
  useEffect(() => {
    if (!result) { navigate("/dashboard"); return; }
    if (result.passed && !confettiFired) {
      setConfettiFired(true);
      const end = Date.now() + 3000;
      const colors = ["#3B82F6", "#10B981", "#F59E0B"];
      (function frame() {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }
  }, [result]);

  if (!result) return null;

  const { score, passed, correct_answers, total_questions, passing_score, certificate, attempts_remaining } = result;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Result Card */}
        <Card className={`p-8 text-center mb-6 ${passed ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200" : "bg-gradient-to-br from-red-50 to-orange-50 border-red-200"}`}>
          <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${passed ? "bg-green-500" : "bg-red-500"}`}>
            {passed ? <CheckCircle2 className="w-10 h-10 text-white" /> : <XCircle className="w-10 h-10 text-white" />}
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${passed ? "text-green-900" : "text-red-900"}`}>
            {passed ? "¡Aprobado!" : "No Aprobado"}
          </h1>
          <p className={`text-sm mb-6 ${passed ? "text-green-700" : "text-red-700"}`}>
            {passed ? "¡Felicitaciones! Has completado exitosamente la evaluación" : `No alcanzaste el puntaje mínimo requerido (${passing_score}%)`}
          </p>
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
            <div className="text-6xl font-bold text-gray-900 mb-2">
              {score}<span className="text-3xl text-gray-500">%</span>
            </div>
            <p className="text-sm text-gray-600">Puntaje obtenido</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">{correct_answers}</span>
              </div>
              <p className="text-xs text-gray-600">Correctas</p>
            </div>
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-2xl font-bold text-gray-900">{total_questions - correct_answers}</span>
              </div>
              <p className="text-xs text-gray-600">Incorrectas</p>
            </div>
          </div>
        </Card>

        {/* Details */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Detalles</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">{new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <TrendingUp className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">Puntaje mínimo requerido: {passing_score}%</span>
            </div>
          </div>
        </Card>

        {/* Certificate section */}
        {passed && certificate && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Certificado Disponible</h3>
                <p className="text-sm text-gray-600">{certificate.certificate_number}</p>
              </div>
            </div>
            <Button
              className="w-full h-12 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
              onClick={() => {
                navigate("/certificates");
                toast.success("Certificado disponible en tu perfil");
              }}
            >
              <Download className="w-5 h-5 mr-2" />
              Ver Certificado
            </Button>
          </Card>
        )}

        {/* Retry section */}
        {!passed && (
          <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2">¿Qué puedes hacer?</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span><span>Revisa nuevamente el material del curso</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span><span>Consulta los recursos adicionales disponibles</span></li>
              {attempts_remaining > 0 && (
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span><span>Tienes {attempts_remaining} intento{attempts_remaining !== 1 ? "s" : ""} restante{attempts_remaining !== 1 ? "s" : ""}</span></li>
              )}
            </ul>
          </Card>
        )}

        {!passed && attempts_remaining <= 0 && (
          <Card className="p-6 mb-6 bg-red-50 border-red-200">
            <div className="flex gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Intentos agotados</h3>
                <p className="text-sm text-red-700">Deberás esperar el período de espera antes de intentarlo nuevamente.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          {!passed && attempts_remaining > 0 && (
            <Button className="w-full h-12 bg-primary hover:bg-blue-600" onClick={() => navigate(`/evaluation/${id}`)}>
              <RefreshCcw className="w-5 h-5 mr-2" />
              Intentar Nuevamente
            </Button>
          )}
          <Button variant="outline" className="w-full h-12" onClick={() => navigate("/dashboard")}>
            <Home className="w-5 h-5 mr-2" />
            Volver al Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
