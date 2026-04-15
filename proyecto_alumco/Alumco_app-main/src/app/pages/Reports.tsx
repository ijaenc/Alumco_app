import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import { ArrowLeft, Download, TrendingUp, Users, BookOpen, Award, BarChart3, Loader2 } from "lucide-react";
import { adminService, type DashboardStats, type CourseStats } from "../services/adminService";
import { useAuth } from "../context/AuthContext";

export default function Reports() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [courseStats, setCourseStats] = useState<CourseStats[]>([]);
  const [loading, setLoading] = useState(true);
  const isTeacher = user?.role === "teacher";

  useEffect(() => {
    const loadReports = async () => {
      try {
        const courses = await adminService.getCourseStats();
        setCourseStats(courses);

        if (!isTeacher) {
          const dashboardStats = await adminService.getDashboardStats();
          setStats(dashboardStats);
        }
      } catch (err) {
        console.error("No se pudieron cargar los reportes", err);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [isTeacher]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const teacherAverage = courseStats.length > 0
    ? Math.round(
        courseStats.reduce((sum, course) => sum + (course.average_score * course.total_attempts), 0) /
        Math.max(courseStats.reduce((sum, course) => sum + course.total_attempts, 0), 1)
      )
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")} className="text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">Reportes y Análisis</h2>
              <p className="text-sm text-gray-500">{isTeacher ? "Resumen de rendimiento de tus cursos" : "Estadísticas de la plataforma"}</p>
            </div>
            <Button size="sm" variant="outline" disabled>
              <Download className="w-4 h-4 mr-1" />
              Exportar
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-6 space-y-6">
        {stats && (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-xs text-blue-700">Usuarios</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{stats.totalStudents}</p>
              <p className="text-xs text-blue-600 mt-1">
                <TrendingUp className="w-3 h-3 inline" /> {stats.activeEnrollments} inscripciones
              </p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-green-600" />
                <span className="text-xs text-green-700">Certificados</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{stats.totalCertificates}</p>
              <p className="text-xs text-green-600 mt-1">
                <TrendingUp className="w-3 h-3 inline" /> {stats.passRate}% tasa aprobación
              </p>
            </Card>
          </div>
        )}

        {isTeacher && (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className="text-xs text-blue-700">Cursos</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{courseStats.length}</p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-green-600" />
                <span className="text-xs text-green-700">Inscripciones</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{courseStats.reduce((sum, course) => sum + course.enrolled_students, 0)}</p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-yellow-600" />
                <span className="text-xs text-yellow-700">Certificados</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900">{courseStats.reduce((sum, course) => sum + course.certificates_issued, 0)}</p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-xs text-purple-700">Nota promedio</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{teacherAverage}%</p>
            </Card>
          </div>
        )}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-gray-100">
            <TabsTrigger value="overview">General</TabsTrigger>
            <TabsTrigger value="courses">Cursos</TabsTrigger>
            <TabsTrigger value="activity">Actividad</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {stats ? (
              <>
                <Card className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Resumen Global</h3>
                  <div className="space-y-4">
                    {[
                      { label: "Tasa de aprobación", value: stats.passRate },
                      { label: "Promedio de puntajes", value: stats.averageScore },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-700">{item.label}</span>
                          <span className="text-sm font-semibold text-gray-900">{item.value}%</span>
                        </div>
                        <Progress value={item.value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Distribución de Intentos</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Aprobados", value: stats.totalCertificates, color: "#10B981" },
                      { label: "Total intentos", value: stats.totalAttempts, color: "#3B82F6" },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm text-gray-700">{item.label}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                        </div>
                        <Progress value={stats.totalAttempts > 0 ? (item.value / stats.totalAttempts) * 100 : 0} className="h-2" />
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Resumen General</h3>
                <p className="text-sm text-gray-600">
                  {isTeacher ? "Usa la pestaña de cursos para revisar el rendimiento de tus capacitaciones." : "No hay suficientes datos globales para mostrar este resumen."}
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="courses" className="space-y-6 mt-6">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Tasa de Aprobación por Curso</h3>
                <BookOpen className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {courseStats.map((course) => {
                  const passRate = course.total_attempts > 0 ? Math.round((course.passed_attempts / course.total_attempts) * 100) : 0;
                  return (
                    <div key={course.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-700 truncate flex-1 mr-2">{course.title}</span>
                        <span className="text-sm font-medium text-green-600 flex-shrink-0">{passRate}% aprobación</span>
                      </div>
                      <div className="flex gap-1 h-3">
                        <div className="bg-green-500 rounded-l-full" style={{ width: `${passRate}%` }} />
                        <div className="bg-orange-400 rounded-r-full" style={{ width: `${100 - passRate}%` }} />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{course.enrolled_students} estudiantes · {course.total_attempts} intentos</p>
                    </div>
                  );
                })}
                {courseStats.length === 0 && <p className="text-center text-gray-500 py-4">No hay datos de cursos</p>}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6 mt-6">
            {stats && stats.recentActivity.length > 0 ? (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
                <div className="space-y-3">
                  {stats.recentActivity.map((activity, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${activity.passed ? "bg-green-500" : "bg-red-400"}`}>
                          {activity.score}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm">{activity.student_name}</h4>
                          <p className="text-xs text-gray-500 truncate">{activity.course_title}</p>
                          <p className="text-xs text-gray-400">{new Date(activity.date).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${activity.passed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                          {activity.passed ? "Aprobó" : "Reprobó"}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <BarChart3 className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-gray-600">{isTeacher ? "La actividad global solo está disponible para administración." : "No hay actividad reciente"}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
