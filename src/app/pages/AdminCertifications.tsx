import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  ArrowLeft,
  Search,
  Download,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  User,
  TrendingUp,
  Filter,
} from "lucide-react";
import {
  getAllUserProgress,
  getUsersWithCertificates,
  downloadUserCertificate,
  type UserProgress,
} from "../services/userManagementService";
import { toast } from "sonner";

export default function AdminCertifications() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  const allProgress = getAllUserProgress();
  const certificatesReady = getUsersWithCertificates();

  const filteredProgress = allProgress.filter((progress) => {
    const matchesSearch =
      progress.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      progress.trainingTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "completed" && progress.status === "completed") ||
      (activeTab === "in_progress" && progress.status === "in_progress") ||
      (activeTab === "failed" && progress.status === "failed");

    return matchesSearch && matchesTab;
  });

  const handleDownloadCertificate = (userId: string, userName: string, certificateId: string) => {
    const success = downloadUserCertificate(userId, certificateId);
    if (success) {
      toast.success(`Certificado descargado`, {
        description: `Usuario: ${userName}`,
      });
    }
  };

  const getStatusBadge = (status: UserProgress["status"]) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
            <CheckCircle className="w-3 h-3" />
            Aprobado
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
            <XCircle className="w-3 h-3" />
            Reprobado
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            <Clock className="w-3 h-3" />
            En progreso
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700">
            Sin iniciar
          </span>
        );
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "text-gray-600";
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const stats = {
    total: allProgress.length,
    completed: allProgress.filter((p) => p.status === "completed").length,
    inProgress: allProgress.filter((p) => p.status === "in_progress").length,
    failed: allProgress.filter((p) => p.status === "failed").length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin")}
              className="text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">
                Gestión de Certificaciones
              </h1>
              <p className="text-xs text-gray-500">
                Administra el progreso y certificados de los usuarios
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por usuario o capacitación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 pb-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-lg font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Aprobados</p>
                <p className="text-lg font-bold text-green-600">{stats.completed}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">En progreso</p>
                <p className="text-lg font-bold text-blue-600">{stats.inProgress}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Reprobados</p>
                <p className="text-lg font-bold text-red-600">{stats.failed}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="completed">Aprobados</TabsTrigger>
            <TabsTrigger value="in_progress">En progreso</TabsTrigger>
            <TabsTrigger value="failed">Reprobados</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Progress List */}
        {filteredProgress.length > 0 ? (
          <div className="space-y-3">
            {filteredProgress.map((progress) => (
              <Card key={`${progress.userId}-${progress.trainingId}`} className="p-4">
                <div className="flex items-start gap-3">
                  {/* User Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {getInitials(progress.userName)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {progress.userName}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {progress.trainingTitle}
                        </p>
                      </div>
                      {getStatusBadge(progress.status)}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progreso</span>
                        <span className="font-medium">{progress.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${progress.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {progress.score !== undefined && (
                        <div>
                          <p className="text-xs text-gray-500">Calificación</p>
                          <p className={`text-sm font-semibold ${getScoreColor(progress.score)}`}>
                            {progress.score}%
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500">Intentos</p>
                        <p className="text-sm font-medium text-gray-900">
                          {progress.attempts} / {progress.maxAttempts}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Última actividad</p>
                        <p className="text-sm font-medium text-gray-900">
                          {progress.lastActivity.toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                      {progress.certificateStatus && (
                        <div>
                          <p className="text-xs text-gray-500">Certificado</p>
                          <p className="text-sm font-medium text-green-600 capitalize">
                            {progress.certificateStatus === "issued"
                              ? "Emitido"
                              : progress.certificateStatus === "downloaded"
                              ? "Descargado"
                              : "Pendiente"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {progress.certificateId && (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleDownloadCertificate(
                            progress.userId,
                            progress.userName,
                            progress.certificateId!
                          )
                        }
                        className="w-full bg-primary hover:bg-blue-600"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar Certificado
                      </Button>
                    )}
                  </div>
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
              No se encontraron resultados
            </h3>
            <p className="text-sm text-gray-600 text-center">
              {searchQuery
                ? "Intenta con otra búsqueda"
                : "No hay registros para mostrar"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
