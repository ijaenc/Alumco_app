import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Users, Award, TrendingUp, Calendar, BookOpen, Star, MapPin, Trophy } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function AdminReports() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');

  // Datos simulados (General)
  const meses = [
    { mes: 'Ene', valor: 45, width: '45%' },
    { mes: 'Feb', valor: 52, width: '52%' },
    { mes: 'Mar', valor: 61, width: '61%' },
    { mes: 'Abr', valor: 73, width: '73%' },
    { mes: 'May', valor: 85, width: '85%' },
    { mes: 'Jun', valor: 98, width: '98%' },
  ];

  // Datos simulados (Cursos)
  const topCursos = [
    { nombre: 'Derechos Humanos Fundamentales', inscritos: 145, completados: 120, porcentaje: '82%' },
    { nombre: 'Gestión de Proyectos Sociales', inscritos: 98, completados: 65, porcentaje: '66%' },
    { nombre: 'Comunicación Asertiva', inscritos: 76, completados: 50, porcentaje: '65%' },
    { nombre: 'Liderazgo Comunitario', inscritos: 64, completados: 40, porcentaje: '62%' },
  ];

  // Datos simulados (Usuarios)
  const distribucionSedes = [
    { nombre: 'Santiago', usuarios: 150, color: 'bg-blue-500', width: '60%' },
    { nombre: 'Patahual', usuarios: 60, color: 'bg-green-500', width: '24%' },
    { nombre: 'Concepción', usuarios: 38, color: 'bg-purple-500', width: '16%' },
  ];

  const alumnosDestacados = [
    { nombre: 'Constanza Rivas', sede: 'Santiago', cursos: 5, iniciales: 'CR', color: 'bg-orange-100 text-orange-600' },
    { nombre: 'Felipe Marín', sede: 'Patahual', cursos: 4, iniciales: 'FM', color: 'bg-blue-100 text-blue-600' },
    { nombre: 'Elena Poblete', sede: 'Concepción', cursos: 4, iniciales: 'EP', color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-10">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-gray-600 hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Reportes y Análisis</h1>
              <p className="text-sm text-gray-500">Monitoreo de desempeño global</p>
            </div>
          </div>
          <Button variant="outline" className="flex items-center gap-2 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-all border-gray-200">
            <Download className="w-4 h-4" /> Exportar
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-8 space-y-8">
        
        {/* Tarjetas Principales (Azul y Verde) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-3xl relative overflow-hidden transition-transform hover:scale-[1.01]">
            <div className="flex items-center gap-2 text-blue-600 mb-6">
              <Users className="w-5 h-5" />
              <span className="font-semibold text-sm">Usuarios Totales</span>
            </div>
            <p className="text-5xl font-bold text-slate-800 mb-8">248</p>
            <div className="flex items-center gap-1 text-blue-600 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              <span>+12% este mes</span>
            </div>
          </div>
          
          <div className="bg-green-50/50 border border-green-100 p-6 rounded-3xl relative overflow-hidden transition-transform hover:scale-[1.01]">
            <div className="flex items-center gap-2 text-green-600 mb-6">
              <Award className="w-5 h-5" />
              <span className="font-semibold text-sm">Certificados Emitidos</span>
            </div>
            <p className="text-5xl font-bold text-slate-800 mb-8">186</p>
            <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              <span>+24 esta semana</span>
            </div>
          </div>
        </div>

        {/* Pestañas (Tabs) */}
        <div className="bg-white rounded-full p-1 border border-gray-200 flex mx-auto w-full max-w-lg shadow-sm">
          <button 
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-2 text-sm font-bold rounded-full transition-all ${activeTab === 'general' ? 'bg-slate-800 shadow-md text-white' : 'text-gray-500 hover:text-gray-800'}`}
          >
            General
          </button>
          <button 
            onClick={() => setActiveTab('cursos')}
            className={`flex-1 py-2 text-sm font-bold rounded-full transition-all ${activeTab === 'cursos' ? 'bg-slate-800 shadow-md text-white' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Cursos
          </button>
          <button 
            onClick={() => setActiveTab('usuarios')}
            className={`flex-1 py-2 text-sm font-bold rounded-full transition-all ${activeTab === 'usuarios' ? 'bg-slate-800 shadow-md text-white' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Usuarios
          </button>
        </div>

        {/* ── CONTENIDO PESTAÑA: GENERAL ── */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Inscripciones Mensuales */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-slate-800 text-lg">Inscripciones Mensuales</h3>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {meses.map((m, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <span className="text-sm text-gray-500 w-8 group-hover:text-slate-800 transition-colors">{m.mes}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: m.width }}></div>
                    </div>
                    <span className="text-sm font-bold text-slate-800 w-6 text-right">{m.valor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Distribución de Certificaciones */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <h3 className="font-bold text-slate-800 text-lg mb-8">Distribución de Certificaciones</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-200"></div>
                      <span className="text-sm font-medium text-gray-600">Aprobados</span>
                    </div>
                    <span className="font-bold text-slate-800">186</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-200"></div>
                      <span className="text-sm font-medium text-gray-600">Reprobados</span>
                    </div>
                    <span className="font-bold text-slate-800">34</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm shadow-yellow-200"></div>
                      <span className="text-sm font-medium text-gray-600">Pendientes</span>
                    </div>
                    <span className="font-bold text-slate-800">28</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── CONTENIDO PESTAÑA: CURSOS ── */}
        {activeTab === 'cursos' && (
          <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Rendimiento de Cursos</h3>
                  <p className="text-sm text-gray-500">Métricas de completitud por programa</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-6">
                {topCursos.map((curso, idx) => (
                  <div key={idx} className="p-4 border border-gray-50 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-slate-800 text-sm md:text-base">{curso.nombre}</h4>
                      <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-lg">{curso.porcentaje} completado</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>{curso.inscritos} inscritos</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Award className="w-4 h-4" />
                        <span>{curso.completados} graduados</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-4 overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: curso.porcentaje }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CONTENIDO PESTAÑA: USUARIOS ── */}
        {activeTab === 'usuarios' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Distribución por Sedes */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-slate-800 text-lg">Distribución por Sede</h3>
                <MapPin className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-6">
                {distribucionSedes.map((sede, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-slate-700">{sede.nombre}</span>
                      <span className="text-sm font-semibold text-gray-500">{sede.usuarios} usuarios</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div className={`${sede.color} h-full rounded-full transition-all duration-1000`} style={{ width: sede.width }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alumnos Destacados */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800 text-lg">Alumnos Destacados</h3>
                <div className="p-2 bg-yellow-50 rounded-xl text-yellow-600">
                  <Trophy className="w-5 h-5" />
                </div>
              </div>
              
              <div className="space-y-4">
                {alumnosDestacados.map((alumno, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-sm ${alumno.color}`}>
                      {alumno.iniciales}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 text-sm">{alumno.nombre}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {alumno.sede}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-yellow-500 mb-0.5">
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{alumno.cursos} Cursos</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}