import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Logo } from "../components/Logo";
import {
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  ChevronRight,
  LogOut,
  Play,
  FileText,
  MessageCircle,
  Bell,
} from "lucide-react";
import { getUnreadCount } from "../services/messageService";
import { getCertificatesCount } from "../services/certificateService";

const trainings = [
  {
    id: 1,
    title: "Derechos Humanos Fundamentales",
    description: "Introducción a los derechos humanos básicos",
    progress: 75,
    duration: "2h 30min",
    modules: "4 de 5",
    status: "En progreso",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=250&fit=crop",
  },
  {
    id: 2,
    title: "Gestión de Proyectos Sociales",
    description: "Aprende a gestionar proyectos comunitarios",
    progress: 30,
    duration: "3h 15min",
    modules: "2 de 6",
    status: "En progreso",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop",
  },
  {
    id: 3,
    title: "Comunicación Efectiva",
    description: "Técnicas de comunicación para el trabajo social",
    progress: 0,
    duration: "1h 45min",
    modules: "0 de 4",
    status: "No iniciado",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=250&fit=crop",
  },
];

const certificates = [
  {
    id: 1,
    title: "Primeros Auxilios",
    date: "15 Mar 2024",
    score: 95,
  },
  {
    id: 2,
    title: "Trabajo en Equipo",
    date: "02 Mar 2024",
    score: 88,
  },
];

export default function UserDashboard() {
  const navigate = useNavigate();
  const unreadMessages = getUnreadCount();
  const totalCertificates = getCertificatesCount();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Logo className="text-white" size={24} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Mi Aprendizaje</h2>
              <p className="text-xs text-gray-500">Usuario</p>
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
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-1">
                ¡Hola, María! 👋
              </h3>
              <p className="text-blue-100 text-sm mb-4">
                Continúa con tu capacitación
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>3 Cursos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>2 Certificados</span>
                </div>
              </div>
            </div>
            <TrendingUp className="w-12 h-12 opacity-30" />
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card 
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate("/messages")}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center relative">
                <MessageCircle className="w-5 h-5 text-primary" />
                {unreadMessages > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {unreadMessages}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500">Mensajes</p>
                <p className="font-semibold text-gray-900">
                  {unreadMessages} nuevo{unreadMessages !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </Card>
          <Card 
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate("/certificates")}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Certificados</p>
                <p className="font-semibold text-gray-900">{totalCertificates} obtenidos</p>
              </div>
            </div>
          </Card>
        </div>

        {/* My Trainings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Mis Capacitaciones</h3>
            <Button variant="ghost" size="sm" className="text-primary">
              Ver todas
            </Button>
          </div>
          <div className="space-y-3">
            {trainings.map((training) => (
              <Card
                key={training.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/training/${training.id}`)}
              >
                <div className="flex gap-3">
                  <img
                    src={training.image}
                    alt={training.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1 truncate">
                      {training.title}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                      {training.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        {training.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {training.modules}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={training.progress} className="h-2" />
                      <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                        {training.progress}%
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Certificates */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Mis Certificados</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary"
              onClick={() => navigate("/certificates")}
            >
              Ver todos
            </Button>
          </div>
          <div className="space-y-3">
            {certificates.map((cert) => (
              <Card 
                key={cert.id} 
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate("/certificates")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {cert.title}
                    </h4>
                    <p className="text-xs text-gray-500">{cert.date}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">
                      {cert.score}
                    </div>
                    <p className="text-xs text-gray-500">Puntos</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}