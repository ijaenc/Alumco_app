import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Logo } from "../components/Logo";
import {
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Settings,
  LogOut,
  FileText,
  BarChart3,
  Clock,
  CheckCircle,
  MessageCircle,
  Send,
} from "lucide-react";
import { getAdminStatistics } from "../services/userManagementService";

const stats = [
  {
    label: "Usuarios Activos",
    value: "248",
    change: "+12%",
    trend: "up",
    icon: Users,
    color: "blue",
  },
  {
    label: "Cursos Totales",
    value: "32",
    change: "+3",
    trend: "up",
    icon: BookOpen,
    color: "purple",
  },
  {
    label: "Certificados",
    value: "186",
    change: "+24",
    trend: "up",
    icon: Award,
    color: "yellow",
  },
  {
    label: "Tasa Aprobación",
    value: "87%",
    change: "+5%",
    trend: "up",
    icon: TrendingUp,
    color: "green",
  },
];

const quickActions = [
  {
    label: "Gestión de Cursos",
    description: "Crear y editar contenido",
    icon: BookOpen,
    route: "/admin/panel",
    color: "blue",
  },
  {
    label: "Ver Reportes",
    description: "Estadísticas y análisis",
    icon: BarChart3,
    route: "/admin/reports",
    color: "green",
  },
  {
    label: "Mensajería",
    description: "Mensajes y comunicación",
    icon: MessageCircle,
    route: "/admin/messages",
    color: "purple",
  },
  {
    label: "Certificaciones",
    description: "Gestionar certificados",
    icon: Award,
    route: "/admin/certifications",
    color: "yellow",
  },
];

const recentActivity = [
  {
    user: "María González",
    action: "Completó el curso",
    course: "Derechos Humanos",
    time: "Hace 5 min",
    type: "completion",
  },
  {
    user: "Juan Pérez",
    action: "Aprobó evaluación",
    course: "Gestión de Proyectos",
    time: "Hace 15 min",
    type: "evaluation",
  },
  {
    user: "Ana Martínez",
    action: "Se inscribió en",
    course: "Comunicación Efectiva",
    time: "Hace 1 hora",
    type: "enrollment",
  },
  {
    user: "Carlos López",
    action: "Completó el curso",
    course: "Primeros Auxilios",
    time: "Hace 2 horas",
    type: "completion",
  },
];

const getColorClasses = (color: string) => {
  const colors: { [key: string]: { bg: string; text: string; icon: string } } = {
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      icon: "text-blue-600",
    },
    purple: {
      bg: "bg-purple-100",
      text: "text-purple-700",
      icon: "text-purple-600",
    },
    yellow: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      icon: "text-yellow-600",
    },
    green: {
      bg: "bg-green-100",
      text: "text-green-700",
      icon: "text-green-600",
    },
    orange: {
      bg: "bg-orange-100",
      text: "text-orange-700",
      icon: "text-orange-600",
    },
  };
  return colors[color] || colors.blue;
};

export default function AdminDashboard() {
  const navigate = useNavigate();

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
                <h2 className="font-semibold text-gray-900">
                  Panel Administrador
                </h2>
                <p className="text-xs text-gray-500">Gestión de plataforma</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-gray-600"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 p-6 text-white">
          <h3 className="text-xl font-semibold mb-1">
            Bienvenido, Admin 👋
          </h3>
          <p className="text-blue-100 text-sm">
            Aquí tienes un resumen de la actividad de la plataforma
          </p>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => {
            const colors = getColorClasses(stat.color);
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${colors.icon}`} />
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-600">{stat.label}</p>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Accesos Rápidos</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => {
              const colors = getColorClasses(action.color);
              const Icon = action.icon;
              return (
                <Card
                  key={index}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(action.route)}
                >
                  <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm mb-1">
                    {action.label}
                  </h4>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Actividad Reciente</h3>
            <Button variant="ghost" size="sm" className="text-primary">
              Ver todo
            </Button>
          </div>
          <Card className="divide-y divide-gray-100">
            {recentActivity.map((activity, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.type === "completion"
                      ? "bg-green-100"
                      : activity.type === "evaluation"
                      ? "bg-blue-100"
                      : "bg-purple-100"
                  }`}>
                    {activity.type === "completion" ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : activity.type === "evaluation" ? (
                      <Award className="w-4 h-4 text-blue-600" />
                    ) : (
                      <BookOpen className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user}</span>{" "}
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-600">{activity.course}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}