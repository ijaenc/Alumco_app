import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LogOut, ChevronRight, Users, BookOpen, Award, TrendingUp, 
  CheckCircle, FileText, AlertCircle, Star, Book, MapPin, 
  School, BarChart2, MessageSquare
} from 'lucide-react';

const AdminDashboard = () => {
  const [sedeActual, setSedeActual] = useState('Todas');
  const navigate = useNavigate();

  const datosPorSede: any = {
    'Todas': {
      stats: [
        { titulo: 'Usuarios Activos', valor: '248', extra: '+12%', icon: <Users className="w-6 h-6" />, color: 'bg-blue-50 text-blue-600' },
        { titulo: 'Cursos Totales', valor: '32', extra: '+3', icon: <BookOpen className="w-6 h-6" />, color: 'bg-purple-50 text-purple-600' },
        { titulo: 'Certificados', valor: '186', extra: '+24', icon: <Award className="w-6 h-6" />, color: 'bg-yellow-50 text-yellow-600' },
        { titulo: 'Tasa Aprobación', valor: '87%', extra: '+5%', icon: <TrendingUp className="w-6 h-6" />, color: 'bg-green-50 text-green-600' },
      ],
      actividad: [
        { user: 'María González', action: 'Completó el curso', subject: 'Derechos Humanos', time: 'Hace 5 min', icon: <CheckCircle className="w-5 h-5"/>, color: 'text-green-500 bg-green-50' },
        { user: 'Juan Pérez', action: 'Aprobó evaluación', subject: 'Gestión de Proyectos', time: 'Hace 15 min', icon: <Award className="w-5 h-5"/>, color: 'text-blue-500 bg-blue-50' },
        { user: 'Ana Martínez', action: 'Se inscribió en', subject: 'Comunicación Efectiva', time: 'Hace 1 hora', icon: <BookOpen className="w-5 h-5"/>, color: 'text-purple-500 bg-purple-50' },
      ]
    },
    'Santiago': {
      stats: [
        { titulo: 'Usuarios Activos', valor: '150', extra: '+8%', icon: <Users className="w-6 h-6" />, color: 'bg-blue-50 text-blue-600' },
        { titulo: 'Cursos Totales', valor: '20', extra: '+1', icon: <BookOpen className="w-6 h-6" />, color: 'bg-purple-50 text-purple-600' },
        { titulo: 'Certificados', valor: '110', extra: '+15', icon: <Award className="w-6 h-6" />, color: 'bg-yellow-50 text-yellow-600' },
        { titulo: 'Tasa Aprobación', valor: '92%', extra: '+2%', icon: <TrendingUp className="w-6 h-6" />, color: 'bg-green-50 text-green-600' },
      ],
      actividad: [
        { user: 'Constanza Rivas', action: 'Inició curso', subject: 'Liderazgo', time: 'Hace 2 min', icon: <TrendingUp className="w-5 h-5"/>, color: 'text-orange-500 bg-orange-50' },
        { user: 'Ricardo Soto', action: 'Subió documento', subject: 'Ética', time: 'Hace 10 min', icon: <FileText className="w-5 h-5"/>, color: 'text-blue-500 bg-blue-50' },
      ]
    },
    'Patahual': {
      stats: [
        { titulo: 'Usuarios Activos', valor: '60', extra: '+5%', icon: <Users className="w-6 h-6" />, color: 'bg-blue-50 text-blue-600' },
        { titulo: 'Cursos Totales', valor: '8', extra: '0', icon: <BookOpen className="w-6 h-6" />, color: 'bg-purple-50 text-purple-600' },
        { titulo: 'Certificados', valor: '45', extra: '+2', icon: <Award className="w-6 h-6" />, color: 'bg-yellow-50 text-yellow-600' },
        { titulo: 'Tasa Aprobación', valor: '78%', extra: '-1%', icon: <TrendingUp className="w-6 h-6" />, color: 'bg-green-50 text-green-600' },
      ],
      actividad: [
        { user: 'Felipe Marín', action: 'Reprobó intento', subject: 'Derechos Humanos', time: 'Hace 1 hora', icon: <AlertCircle className="w-5 h-5"/>, color: 'text-red-500 bg-red-50' },
      ]
    },
    'Concepcion': {
      stats: [
        { titulo: 'Usuarios Activos', valor: '38', extra: '+15%', icon: <Users className="w-6 h-6" />, color: 'bg-blue-50 text-blue-600' },
        { titulo: 'Cursos Totales', valor: '4', extra: '+2', icon: <BookOpen className="w-6 h-6" />, color: 'bg-purple-50 text-purple-600' },
        { titulo: 'Certificados', valor: '31', extra: '+8', icon: <Award className="w-6 h-6" />, color: 'bg-yellow-50 text-yellow-600' },
        { titulo: 'Tasa Aprobación', valor: '85%', extra: '+4%', icon: <TrendingUp className="w-6 h-6" />, color: 'bg-green-50 text-green-600' },
      ],
      actividad: [
        { user: 'Elena Poblete', action: 'Nueva inscripción', subject: 'Prevención', time: 'Hace 30 min', icon: <Star className="w-5 h-5"/>, color: 'text-yellow-500 bg-yellow-50' },
      ]
    }
  };

  const vistaActual = datosPorSede[sedeActual];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-800">
      
      {/* Header Principal */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            {/* Si no encuentra la imagen, mostrará un circulito gris en lugar de explotar */}
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 border border-gray-200">
               <img 
                 src="/logo.png" 
                 alt="A" 
                 className="w-full h-full object-cover"
                 onError={(e) => {
                   // Esto evita que salga el icono de imagen rota si el archivo no existe
                   (e.target as HTMLImageElement).style.display = 'none';
                 }}
               />
            </div>
            Alumco Admin
          </h1>
          <p className="text-sm text-slate-500">Panel de Gestión Principal</p>
        </div>
        
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm text-sm font-bold"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Banner Azul */}
        <div className="bg-blue-600 rounded-3xl p-6 md:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Bienvenido, Admin 👋</h2>
            <p className="text-blue-100 text-sm md:text-base">Revisa las estadísticas y gestiona tu plataforma.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-lg">
            <span className="text-sm font-medium text-gray-400"><MapPin className="w-4 h-4 inline" /> Sede:</span>
            <select 
              className="bg-transparent text-base font-bold text-blue-600 outline-none cursor-pointer"
              value={sedeActual}
              onChange={(e) => setSedeActual(e.target.value)}
            >
              <option value="Todas">Todas las sedes</option>
              <option value="Santiago">Santiago</option>
              <option value="Patahual">Patahual</option>
              <option value="Concepcion">Concepción</option>
            </select>
          </div>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {vistaActual.stats.map((stat: any, i: number) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.color}`}>
                  {stat.icon}
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${stat.extra.includes('-') ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                  {stat.extra}
                </span>
              </div>
              <div>
                <p className="text-4xl font-bold text-slate-800 mb-2">{stat.valor}</p>
                <p className="text-sm text-gray-500 font-medium">{stat.titulo}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Accesos Rápidos */}
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-4">Accesos Rápidos</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { titulo: 'Capacitaciones', desc: 'Vista general', icon: <Book className="w-6 h-6" />, color: 'bg-indigo-50 text-indigo-600', ruta: '/admin/trainings-view' },
              { titulo: 'Sedes y Estadísticas', desc: 'Análisis por ubicación', icon: <MapPin className="w-6 h-6" />, color: 'bg-blue-50 text-blue-600', ruta: '/admin/sedes' },
              { titulo: 'Gestión de Usuarios', desc: 'Crear y administrar', icon: <Users className="w-6 h-6" />, color: 'bg-green-50 text-green-600', ruta: '/admin/students' },
              { titulo: 'Gestión Profesores', desc: 'Ver personal', icon: <School className="w-6 h-6" />, color: 'bg-orange-50 text-orange-600', ruta: '/admin/teachers' }, 
              { titulo: 'Ver Reportes', desc: 'Datos detallados', icon: <BarChart2 className="w-6 h-6" />, color: 'bg-purple-50 text-purple-600', ruta: '/admin/reports' },
              { titulo: 'Mensajería', desc: 'Comunicación', icon: <MessageSquare className="w-6 h-6" />, color: 'bg-teal-50 text-teal-600', ruta: '/admin/messages' },
              { titulo: 'Certificaciones', desc: 'Gestionar diplomas', icon: <Award className="w-6 h-6" />, color: 'bg-yellow-50 text-yellow-600', ruta: '/admin/certifications' },
            ].map((acceso, i) => (
              <Link to={acceso.ruta} key={i} className="block no-underline group">
                <div className="bg-white h-full p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${acceso.color}`}>
                    {acceso.icon}
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">{acceso.titulo}</h4>
                  <p className="text-xs text-slate-500">{acceso.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Actividad Reciente */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-800">Actividad en {sedeActual}</h3>
            <Link 
              to="/admin/reports"
              className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              Ver todo
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-2">
            {vistaActual.actividad.map((act: any, i: number) => (
              <div key={i} className="p-4 rounded-2xl flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${act.color}`}>
                  {act.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-800"><span className="font-bold">{act.user}</span> {act.action}</p>
                  <p className="text-sm text-slate-500">{act.subject}</p>
                </div>
                <span className="text-xs font-medium text-slate-400 bg-gray-50 px-3 py-1 rounded-full">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;