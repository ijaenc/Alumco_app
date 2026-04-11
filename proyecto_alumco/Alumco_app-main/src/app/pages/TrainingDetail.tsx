import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  ArrowLeft, Play, Download, CheckCircle2, Circle,
  FileText, BookOpen, Clock, AlertCircle, Ban, Loader2,
} from "lucide-react";
import { courseService, type Course } from "../services/courseService";
import { evaluationService, type AttemptInfo } from "../services/evaluationService";
import { toast } from "sonner";

export default function TrainingDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeModule, setActiveModule] = useState(0);
  const [course, setCourse] = useState<Course | null>(null);
  const [attemptInfo, setAttemptInfo] = useState<AttemptInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [completingModule, setCompletingModule] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    courseService.getById(id)
      .then(async (data) => {
        setCourse(data);
        // Si el curso tiene evaluación, cargar info de intentos
        if (data.evaluation?.id) {
          try {
            const evalData = await evaluationService.getById(data.evaluation.id);
            setAttemptInfo(evalData.attemptInfo || null);
          } catch {
            // Si hay error (ej: ya aprobó), ignorar
          }
        }
      })
      .catch(() => toast.error("Error cargando el curso"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCompleteModule = async (moduleId: string) => {
    if (!id) return;
    setCompletingModule(moduleId);
    try {
      await courseService.completeModule(id, moduleId);
      // Recargar curso para actualizar progreso
      const updated = await courseService.getById(id);
      setCourse(updated);
      toast.success("¡Módulo completado!");
    } catch (err: any) {
      toast.error(err.message || "Error al completar el módulo");
    } finally {
      setCompletingModule(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) return null;

  const modules = course.modules || [];
  const resources = course.resources || [];
  const totalModules = modules.length;
  const completedModules = modules.filter((m) => m.completed).length;
  const progress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  const thumbnailUrl = course.image_url || "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=450&fit=crop";
  const instructorInitials = course.instructor_name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  const canAttempt = attemptInfo?.canAttempt ?? true;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 text-sm">Detalle del Curso</h2>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto">
        {/* Video Player */}
        <div className="relative aspect-video bg-gray-900">
          <img src={thumbnailUrl} alt="Video thumbnail" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 flex items-center justify-center">
            <button className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
              <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
            </button>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <Progress value={progress} className="h-1 bg-white/30" />
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Course Info */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">{course.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {completedModules}/{totalModules} módulos
              </span>
              {course.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {course.duration}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Progress value={progress} className="h-2 flex-1" />
              <span className="text-sm font-medium text-gray-700">{progress}%</span>
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
                <h3 className="font-semibold text-gray-900 mb-2">Acerca del curso</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{course.description}</p>
              </Card>
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Instructor</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{instructorInitials}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{course.instructor_name}</p>
                    <p className="text-xs text-gray-500">{course.instructor_email || "Instructor"}</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="modules" className="space-y-3 mt-4">
              {modules.map((module, index) => (
                <Card
                  key={module.id}
                  className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${activeModule === index ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setActiveModule(index)}
                >
                  <div className="flex items-center gap-3">
                    {module.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900">{module.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {module.duration && <span className="text-xs text-gray-500">{module.duration}</span>}
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 capitalize">{module.type}</span>
                      </div>
                    </div>
                    {!module.completed ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs flex-shrink-0"
                        disabled={completingModule === module.id}
                        onClick={(e) => { e.stopPropagation(); handleCompleteModule(module.id); }}
                      >
                        {completingModule === module.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Completar"}
                      </Button>
                    ) : (
                      <Play className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </Card>
              ))}
              {modules.length === 0 && (
                <p className="text-center text-gray-500 py-8">Este curso no tiene módulos aún.</p>
              )}
            </TabsContent>

            <TabsContent value="resources" className="space-y-3 mt-4">
              {resources.map((resource) => (
                <Card key={resource.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">{resource.name}</h4>
                      {resource.size && <p className="text-xs text-gray-500">{(resource.size / 1024).toFixed(0)} KB</p>}
                    </div>
                    <Button size="icon" variant="ghost" className="flex-shrink-0" onClick={() => window.open(resource.file_url, "_blank")}>
                      <Download className="w-5 h-5 text-primary" />
                    </Button>
                  </div>
                </Card>
              ))}
              {resources.length === 0 && (
                <p className="text-center text-gray-500 py-8">No hay recursos disponibles.</p>
              )}
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="space-y-3 pb-6">
            {/* Blocked alert */}
            {attemptInfo && !canAttempt && !attemptInfo.alreadyPassed && (
              <Card className="p-4 bg-red-50 border-red-200">
                <div className="flex gap-3">
                  <Ban className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Intentos agotados</p>
                    <p className="text-xs text-red-700 mt-1">{attemptInfo.message}</p>
                    {attemptInfo.unlockDate && (
                      <p className="text-xs text-red-600 mt-2">
                        Disponible nuevamente el{" "}
                        {new Date(attemptInfo.unlockDate).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Already passed */}
            {attemptInfo?.alreadyPassed && (
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-green-900">¡Ya aprobaste esta evaluación! Revisa tus certificados.</p>
                </div>
              </Card>
            )}

            {/* Warning: last attempt */}
            {canAttempt && attemptInfo && attemptInfo.attemptsRemaining < 2 && !attemptInfo.alreadyPassed && (
              <Card className="p-4 bg-yellow-50 border-yellow-200">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">
                      {attemptInfo.attemptsRemaining === 1 ? "¡Último intento disponible!" : `${attemptInfo.attemptsRemaining} intentos restantes`}
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Si no apruebas en tus {attemptInfo.attemptsRemaining} intento{attemptInfo.attemptsRemaining !== 1 ? "s" : ""}, deberás esperar {course.evaluation?.wait_days || 14} días.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {course.evaluation && (
              <Button
                className="w-full h-12 bg-primary hover:bg-blue-600 text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                onClick={() => navigate(`/evaluation/${course.evaluation!.id}`)}
                disabled={!canAttempt && !attemptInfo?.alreadyPassed === false}
              >
                {attemptInfo?.alreadyPassed ? "Evaluación completada" : canAttempt ? "Iniciar Evaluación" : "Evaluación no disponible"}
              </Button>
            )}
            <Button variant="outline" className="w-full h-12 border-gray-300" onClick={() => navigate("/dashboard")}>
              Volver al Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
