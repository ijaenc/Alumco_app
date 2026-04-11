import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Logo } from "../components/Logo";
import {
  BookOpen, Award, TrendingUp, ChevronRight, LogOut,
  Play, FileText, MessageCircle, Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { courseService, type Course } from "../services/courseService";
import { certificateService, type Certificate } from "../services/certificateService";
import { messageService } from "../services/messageService";
import { toast } from "sonner";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [coursesData, certsData, unreadData] = await Promise.all([
          courseService.getAll(),
          certificateService.getAll(),
          messageService.getUnreadCount(),
        ]);
        setCourses(coursesData);
        setCertificates(certsData);
        setUnreadCount(unreadData.count);
      } catch {
        toast.error("Error cargando los datos");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Logo className="text-white" size={24} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Mi Aprendizaje</h2>
              <p className="text-xs text-gray-500">{user?.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-600">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-1">¡Hola, {user?.name?.split(" ")[0]}! 👋</h3>
              <p className="text-blue-100 text-sm mb-4">Continúa con tu capacitación</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{courses.length} Cursos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>{certificates.length} Certificados</span>
                </div>
              </div>
            </div>
            <TrendingUp className="w-12 h-12 opacity-30" />
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/messages")}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center relative">
                <MessageCircle className="w-5 h-5 text-primary" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">{unreadCount}</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500">Mensajes</p>
                <p className="font-semibold text-gray-900">{unreadCount} nuevo{unreadCount !== 1 ? "s" : ""}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/certificates")}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Certificados</p>
                <p className="font-semibold text-gray-900">{certificates.length} obtenidos</p>
              </div>
            </div>
          </Card>
        </div>

        {/* My Courses */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Mis Capacitaciones</h3>
          {courses.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No tienes cursos asignados aún</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => {
                const total = course.total_modules || 0;
                const completed = course.completed_modules || 0;
                const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
                return (
                  <Card
                    key={course.id}
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/training/${course.id}`)}
                  >
                    <div className="flex gap-3">
                      {course.image_url && (
                        <img src={course.image_url} alt={course.title} className="w-20 h-20 rounded-lg object-cover" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-1 truncate">{course.title}</h4>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{course.description}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                          {course.duration && (
                            <span className="flex items-center gap-1"><Play className="w-3 h-3" />{course.duration}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />{completed} de {total} módulos
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="h-2" />
                          <span className="text-xs font-medium text-gray-700 whitespace-nowrap">{progress}%</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Certificates */}
        {certificates.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Mis Certificados</h3>
              <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate("/certificates")}>
                Ver todos
              </Button>
            </div>
            <div className="space-y-3">
              {certificates.slice(0, 2).map((cert) => (
                <Card key={cert.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/certificates")}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{cert.course_title}</h4>
                      <p className="text-xs text-gray-500">
                        {new Date(cert.issued_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">{cert.score}</div>
                      <p className="text-xs text-gray-500">Puntos</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
