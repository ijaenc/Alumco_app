import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import {
  ArrowLeft,
  Download,
  TrendingUp,
  Users,
  BookOpen,
  Award,
  Calendar,
  BarChart3,
} from "lucide-react";

const enrollmentData = [
  { month: "Ene", usuarios: 45 },
  { month: "Feb", usuarios: 52 },
  { month: "Mar", usuarios: 61 },
  { month: "Abr", usuarios: 73 },
  { month: "May", usuarios: 85 },
  { month: "Jun", usuarios: 98 },
];

const courseCompletionData = [
  { curso: "DDHH", completado: 78, pendiente: 22 },
  { curso: "Gestión", completado: 65, pendiente: 35 },
  { curso: "Comunicación", completado: 82, pendiente: 18 },
  { curso: "Primeros Aux.", completado: 91, pendiente: 9 },
];

const certificationData = [
  { name: "Aprobados", value: 186, color: "#10B981" },
  { name: "Reprobados", value: 34, color: "#EF4444" },
  { name: "Pendientes", value: 28, color: "#F59E0B" },
];

const topUsers = [
  { name: "María González", courses: 8, certificates: 7, score: 94 },
  { name: "Juan Pérez", courses: 7, certificates: 6, score: 91 },
  { name: "Ana Martínez", courses: 6, certificates: 6, score: 89 },
  { name: "Carlos López", courses: 6, certificates: 5, score: 87 },
  { name: "Laura Sánchez", courses: 5, certificates: 5, score: 85 },
];

export default function Reports() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin")}
              className="text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900">Reportes y Análisis</h2>
              <p className="text-xs text-gray-500">Estadísticas de la plataforma</p>
            </div>
            <Button size="sm" variant="outline">
              <Download className="w-4 h-4 mr-1" />
              Exportar
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-xs text-blue-700">Usuarios</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">248</p>
            <p className="text-xs text-blue-600 mt-1">
              <TrendingUp className="w-3 h-3 inline" /> +12% este mes
            </p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-green-600" />
              <span className="text-xs text-green-700">Certificados</span>
            </div>
            <p className="text-2xl font-bold text-green-900">186</p>
            <p className="text-xs text-green-600 mt-1">
              <TrendingUp className="w-3 h-3 inline" /> +24 esta semana
            </p>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-gray-100">
            <TabsTrigger value="overview">General</TabsTrigger>
            <TabsTrigger value="courses">Cursos</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  Inscripciones Mensuales
                </h3>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {enrollmentData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{data.month}</span>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${(data.usuarios / 100) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {data.usuarios}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                Distribución de Certificaciones
              </h3>
              <div className="space-y-4">
                {certificationData.map((item) => (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-gray-700">{item.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {item.value}
                      </span>
                    </div>
                    <Progress
                      value={(item.value / 248) * 100}
                      className="h-2"
                      style={{
                        // @ts-ignore
                        "--progress-background": item.color,
                      }}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6 mt-6">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  Tasa de Completación por Curso
                </h3>
                <BookOpen className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {courseCompletionData.map((course, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700">{course.curso}</span>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-green-600 font-medium">
                          {course.completado}% completado
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-orange-600 font-medium">
                          {course.pendiente}% pendiente
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 h-3">
                      <div
                        className="bg-green-500 rounded-l-full"
                        style={{ width: `${course.completado}%` }}
                      />
                      <div
                        className="bg-orange-400 rounded-r-full"
                        style={{ width: `${course.pendiente}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">
                Rendimiento por Curso
              </h3>
              <div className="space-y-3">
                {courseCompletionData.map((course, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {course.curso}
                      </h4>
                      <span className="text-sm font-semibold text-green-600">
                        {course.completado}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${course.completado}%` }}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6 mt-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">
                Top 5 Usuarios Destacados
              </h3>
              <div className="space-y-3">
                {topUsers.map((user, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                            index === 0
                              ? "bg-yellow-500"
                              : index === 1
                              ? "bg-gray-400"
                              : index === 2
                              ? "bg-orange-600"
                              : "bg-blue-500"
                          }`}
                        >
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {user.name}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>{user.courses} cursos</span>
                          <span>•</span>
                          <span>{user.certificates} certificados</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          {user.score}
                        </div>
                        <p className="text-xs text-gray-500">Promedio</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Tendencia Positiva
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    El promedio general de calificaciones ha aumentado un 8% en
                    el último mes
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}