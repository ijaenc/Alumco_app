import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Logo } from "../components/Logo";
import {
  Users, BookOpen, Award, TrendingUp, LogOut,
  BarChart3, Clock, CheckCircle, MessageCircle, Loader2,
} from "lucide-react";
import { adminService, type DashboardStats } from "../services/adminService";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const quickActions = [
  { label: "Gestión de Cursos",  description: "Crear y editar contenido",    icon: BookOpen,      route: "/admin/panel",          color: "blue" },
  { label: "Ver Reportes",       description: "Estadísticas y análisis",      icon: BarChart3,     route: "/admin/reports",         color: "green" },
  { label: "Mensajería",         description: "Mensajes y comunicación",      icon: MessageCircle, route: "/admin/messages",        color: "purple" },
  { label: "Certificaciones",    description: "Gestionar certificados",        icon: Award,         route: "/admin/certifications",  color: "yellow" },
];

const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; icon: string }> = {
    blue:   { bg: "bg-blue-100",   icon: "text-blue-600" },
    purple: { bg: "bg-purple-100", icon: "text-purple-600" },
    yellow: { bg: "bg-yellow-100", icon: "text-yellow-600" },
    green:  { bg: "bg-green-100",  icon: "text-green-600" },
  };
  return colors[color] || colors.blue;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboardStats()
      .then(setStats)
      .catch(() => toast.error("Error cargando estadísticas"))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate("/"); };

  const statCards = stats ? [
    { label: "Estudiantes Activos", value: String(stats.totalStudents),    change: "", icon: Users,      color: "blue" },
    { label: "Cursos Totales",      value: String(stats.totalCourses),     change: "", icon: BookOpen,   color: "purple" },
    { label: "Certificados",        value: String(stats.totalCertificates),change: "", icon: Award,      color: "yellow" },
    { label: "Tasa Aprobación",     value: `${stats.passRate}%`,           change: "", icon: TrendingUp, color: "green" },
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Logo className="text-white" size={24} />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Panel Administrador</h2>
                <p className="text-xs text-gray-500">Gestión de plataforma</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-600">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 p-6 text-white">
          <h3 className="text-xl font-semibold mb-1">Bienvenido, {user?.name?.split(" ")[0]} 👋</h3>
          <p className="text-blue-100 text-sm">Aquí tienes un resumen de la actividad de la plataforma</p>
        </Card>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {statCards.map((stat, index) => {
              const colors = getColorClasses(stat.color);
              const Icon = stat.icon;
              const route = stat.label === "Estudiantes Activos" ? "/admin/students"
                : stat.label === "Certificados" ? "/admin/certifications"
                : null;
              return (
                <Card key={index} className={`p-4 ${route ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
                  onClick={() => route && navigate(route)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${colors.icon}`} />
                    </div>
                    {route && <span className="text-xs text-primary">Ver →</span>}
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                </Card>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Accesos Rápidos</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => {
              const colors = getColorClasses(action.color);
              const Icon = action.icon;
              return (
                <Card key={index} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(action.route)}>
                  <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm mb-1">{action.label}</h4>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        {stats && stats.recentActivity.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
            <Card className="divide-y divide-gray-100">
              {stats.recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${activity.passed ? "bg-green-100" : "bg-red-100"}`}>
                      {activity.passed
                        ? <CheckCircle className="w-4 h-4 text-green-600" />
                        : <Award className="w-4 h-4 text-red-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.student_name}</span>{" "}
                        {activity.passed ? "aprobó" : "intentó"} la evaluación
                      </p>
                      <p className="text-sm text-gray-600">{activity.course_title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-500">
                            {new Date(activity.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                        <span className={`text-xs font-medium ${activity.passed ? "text-green-600" : "text-red-600"}`}>
                          {activity.score}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
