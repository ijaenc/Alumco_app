import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  ArrowLeft,
  Play,
  Download,
  CheckCircle2,
  Circle,
  FileText,
  BookOpen,
  Clock,
  AlertCircle,
  Ban,
} from "lucide-react";
import { canAttemptEvaluation } from "../services/attemptService";

export default function TrainingDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeModule, setActiveModule] = useState(0);
  
  // Check attempt status
  const attemptStatus = canAttemptEvaluation(id || "1");

  const training = {
    title: "Derechos Humanos Fundamentales",
    description:
      "Este curso proporciona una introducción completa a los derechos humanos fundamentales, su historia, evolución y aplicación en el contexto actual. Aprenderás sobre los principales instrumentos internacionales y cómo aplicarlos en tu trabajo diario.",
    progress: 75,
    duration: "2h 30min",
    totalModules: 5,
    completedModules: 4,
    instructor: "Dr. Juan Pérez",
    modules: [
      {
        id: 1,
        title: "Introducción a los DDHH",
        duration: "25 min",
        completed: true,
        type: "video",
      },
      {
        id: 2,
        title: "Historia y Evolución",
        duration: "30 min",
        completed: true,
        type: "video",
      },
      {
        id: 3,
        title: "Instrumentos Internacionales",
        duration: "35 min",
        completed: true,
        type: "video",
      },
      {
        id: 4,
        title: "Aplicación Práctica",
        duration: "40 min",
        completed: true,
        type: "video",
      },
      {
        id: 5,
        title: "Casos de Estudio",
        duration: "20 min",
        completed: false,
        type: "document",
      },
    ],
    resources: [
      {
        id: 1,
        name: "Declaración Universal DDHH.pdf",
        size: "1.2 MB",
      },
      {
        id: 2,
        name: "Guía de Aplicación Práctica.pdf",
        size: "850 KB",
      },
      {
        id: 3,
        name: "Casos de Estudio.pdf",
        size: "2.1 MB",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 text-sm">
              Detalle del Curso
            </h2>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto">
        {/* Video Player */}
        <div className="relative aspect-video bg-gray-900">
          <img
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=450&fit=crop"
            alt="Video thumbnail"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <button className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
              <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
            </button>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <Progress value={training.progress} className="h-1 bg-white/30" />
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Course Info */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              {training.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {training.completedModules}/{training.totalModules} módulos
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {training.duration}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Progress value={training.progress} className="h-2 flex-1" />
              <span className="text-sm font-medium text-gray-700">
                {training.progress}%
              </span>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full grid grid-cols-3 bg-gray-100">
              <TabsTrigger value="overview">Descripción</TabsTrigger>
              <TabsTrigger value="modules">Módulos</TabsTrigger>
              <TabsTrigger value="resources">Recursos</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Acerca del curso
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {training.description}
                </p>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Instructor</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">JP</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {training.instructor}
                    </p>
                    <p className="text-xs text-gray-500">
                      Especialista en DDHH
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="modules" className="space-y-3 mt-4">
              {training.modules.map((module, index) => (
                <Card
                  key={module.id}
                  className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
                    activeModule === index ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setActiveModule(index)}
                >
                  <div className="flex items-center gap-3">
                    {module.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900">
                        {module.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {module.duration}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 capitalize">
                          {module.type}
                        </span>
                      </div>
                    </div>
                    <Play className="w-5 h-5 text-gray-400" />
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="resources" className="space-y-3 mt-4">
              {training.resources.map((resource) => (
                <Card key={resource.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">
                        {resource.name}
                      </h4>
                      <p className="text-xs text-gray-500">{resource.size}</p>
                    </div>
                    <Button size="icon" variant="ghost" className="flex-shrink-0">
                      <Download className="w-5 h-5 text-primary" />
                    </Button>
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="space-y-3 pb-6">
            {/* Attempt Status Alert */}
            {!attemptStatus.canAttempt && (
              <Card className="p-4 bg-red-50 border-red-200">
                <div className="flex gap-3">
                  <Ban className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">
                      Intentos agotados
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      {attemptStatus.message}
                    </p>
                    {attemptStatus.unlockDate && (
                      <p className="text-xs text-red-600 mt-2">
                        Disponible nuevamente el{" "}
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
            
            {/* Attempts Remaining Alert */}
            {attemptStatus.canAttempt && attemptStatus.attemptsRemaining < 2 && (
              <Card className="p-4 bg-yellow-50 border-yellow-200">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">
                      {attemptStatus.attemptsRemaining === 1
                        ? "¡Último intento disponible!"
                        : `${attemptStatus.attemptsRemaining} intentos restantes`}
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Si no apruebas en tus 2 intentos, deberás esperar 2 semanas para volver a intentarlo.
                    </p>
                  </div>
                </div>
              </Card>
            )}
            
            <Button
              className="w-full h-12 bg-primary hover:bg-blue-600 text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
              onClick={() => navigate(`/evaluation/${id}`)}
              disabled={!attemptStatus.canAttempt}
            >
              {attemptStatus.canAttempt ? "Iniciar Evaluación" : "Evaluación no disponible"}
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 border-gray-300"
              onClick={() => navigate("/dashboard")}
            >
              Volver al Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}