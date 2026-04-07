import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  ArrowLeft,
  Search,
  Download,
  Award,
  Calendar,
  User,
  Hash,
  TrendingUp,
  Share2,
  Eye,
} from "lucide-react";
import { getCertificates, downloadCertificate } from "../services/certificateService";
import { toast } from "sonner";

export default function Certificates() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCert, setSelectedCert] = useState<string | null>(null);
  const certificates = getCertificates();

  const filteredCertificates = certificates.filter((cert) =>
    cert.trainingTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = (certId: string, certNumber: string) => {
    const success = downloadCertificate(certId);
    if (success) {
      toast.success("Certificado descargado exitosamente", {
        description: `Certificado ${certNumber}`,
        duration: 3000,
      });
    }
  };

  const handleShare = (cert: any) => {
    // Copy link to clipboard simulation
    navigator.clipboard?.writeText(`https://capacitaciones.ong/certificados/${cert.certificateNumber}`).catch(() => {
      // Fallback if clipboard API is not available
    });
    
    toast.success("Enlace copiado al portapapeles", {
      description: "Puedes compartir tu certificado",
      duration: 3000,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50";
    if (score >= 80) return "text-blue-600 bg-blue-50";
    if (score >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-gray-600 bg-gray-50";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">
                Mis Certificados
              </h1>
              <p className="text-xs text-gray-500">
                {certificates.length} certificado{certificates.length !== 1 ? "s" : ""}{" "}
                obtenido{certificates.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar certificados..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 pb-6">
        {/* Summary Card */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {certificates.length}
              </h2>
              <p className="text-sm text-gray-600">
                Certificados completados
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3">
              <p className="text-xs text-gray-600 mb-1">Promedio</p>
              <p className="text-lg font-bold text-gray-900">
                {certificates.length > 0
                  ? Math.round(
                      certificates.reduce((acc, cert) => acc + cert.score, 0) /
                        certificates.length
                    )
                  : 0}
                %
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3">
              <p className="text-xs text-gray-600 mb-1">Este año</p>
              <p className="text-lg font-bold text-gray-900">
                {
                  certificates.filter(
                    (cert) => cert.issueDate.getFullYear() === 2026
                  ).length
                }
              </p>
            </div>
          </div>
        </Card>

        {/* Certificates List */}
        {filteredCertificates.length > 0 ? (
          <div className="space-y-4">
            {filteredCertificates.map((cert) => (
              <Card
                key={cert.id}
                className={`overflow-hidden transition-all ${
                  selectedCert === cert.id
                    ? "ring-2 ring-primary shadow-lg"
                    : "hover:shadow-md"
                }`}
              >
                {/* Certificate Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white mb-1 leading-tight">
                        {cert.trainingTitle}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-white/90">
                        <Hash className="w-3 h-3" />
                        <span>{cert.certificateNumber}</span>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-full font-semibold text-sm ${getScoreColor(
                        cert.score
                      )}`}
                    >
                      {cert.score}%
                    </div>
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Emitido</p>
                        <p className="text-sm font-medium text-gray-900">
                          {cert.issueDate.toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Instructor</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {cert.instructor}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDownload(cert.id, cert.certificateNumber)}
                      className="flex-1 h-10 bg-primary hover:bg-blue-600 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleShare(cert)}
                      className="h-10 border-gray-300"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Expandable Details */}
                  {selectedCert === cert.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Detalles del certificado
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estado:</span>
                          <span className="font-medium text-green-600">
                            Activo
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Puntaje final:</span>
                          <span className="font-medium text-gray-900">
                            {cert.score}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Código único:</span>
                          <span className="font-medium text-gray-900 text-xs">
                            {cert.certificateNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Toggle Details */}
                  <button
                    onClick={() =>
                      setSelectedCert(selectedCert === cert.id ? null : cert.id)
                    }
                    className="w-full mt-3 py-2 text-xs text-primary font-medium hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {selectedCert === cert.id ? "Ver menos" : "Ver más detalles"}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Award className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? "No se encontraron certificados" : "No hay certificados"}
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              {searchQuery
                ? "Intenta con otra búsqueda"
                : "Completa una capacitación para obtener tu primer certificado"}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => navigate("/dashboard")}
                className="bg-primary hover:bg-blue-600"
              >
                Ver Capacitaciones
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}