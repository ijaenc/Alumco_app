import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Users, BookOpen, Award, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function AdminSedes() {
  const navigate = useNavigate();
  const [sedeActual, setSedeActual] = useState('Global');

  // Datos respetando tus sedes reales
  const sedes = [
    { id: 'Global', nombre: 'Global', desc: 'Todas las sedes', usuarios: 248, max: 248 },
    { id: 'Santiago', nombre: 'Santiago', desc: 'Sede Principal', usuarios: 150, max: 248 },
    { id: 'Patahual', nombre: 'Patahual', desc: 'Sede ONG', usuarios: 60, max: 248 },
    { id: 'Concepcion', nombre: 'Concepción', desc: 'Sede Sur', usuarios: 38, max: 248 },
  ];

  // Estadísticas que cambiarían según la sede
  // Estadísticas que cambiarían según la sede
  const stats = {
    // Le agregamos el "|| 0" al final para que TypeScript sepa que siempre habrá un número
    usuarios: sedeActual === 'Global' ? 248 : (sedes.find(s => s.id === sedeActual)?.usuarios || 0),
    cursos: sedeActual === 'Global' ? 334 : Math.floor(Math.random() * 100 + 50), 
    certificaciones: sedeActual === 'Global' ? 186 : Math.floor(Math.random() * 80 + 20),
    promedio: sedeActual === 'Global' ? 86 : Math.floor(Math.random() * 15 + 75),
    actividad: sedeActual === 'Global' ? 89 : Math.floor(Math.random() * 20 + 75),
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-10">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")} className="text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Sedes y Estadísticas</h1>
            <p className="text-sm text-gray-500">Análisis por ubicación</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Selector de Sedes */}
        <div className="md:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Seleccionar Sede</h2>
          <div className="space-y-3">
            {sedes.map((sede) => {
              const isSelected = sedeActual === sede.id;
              return (
                <button
                  key={sede.id}
                  onClick={() => setSedeActual(sede.id)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50/50 shadow-sm' 
                      : 'border-transparent bg-white hover:border-gray-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-blue-600 text-white' : 'bg-purple-100 text-purple-600'}`}>
                      {sede.id === 'Global' ? <Building2 className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{sede.nombre}</p>
                      <p className="text-xs text-gray-500">{sede.desc}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">{sede.usuarios}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Usuarios</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Columna Derecha: Estadísticas */}
        <div className="md:col-span-2 space-y-8 animate-in fade-in duration-300">
          
          {/* Tarjetas Superiores */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Estadísticas {sedeActual === 'Global' ? 'Globales' : `de ${sedeActual}`}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <p className="text-3xl font-bold text-slate-800 mb-1">{stats.usuarios}</p>
                <p className="text-sm text-gray-500">Total Usuarios</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="w-5 h-5" />
                </div>
                <p className="text-3xl font-bold text-slate-800 mb-1">{stats.cursos}</p>
                <p className="text-sm text-gray-500">Cursos Completados</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center mb-4">
                  <Award className="w-5 h-5" />
                </div>
                <p className="text-3xl font-bold text-slate-800 mb-1">{stats.certificaciones}</p>
                <p className="text-sm text-gray-500">Certificaciones</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <p className="text-3xl font-bold text-slate-800 mb-1">{stats.promedio}</p>
                <p className="text-sm text-gray-500">Promedio</p>
              </div>
            </div>
          </div>

          {/* Tasa de Actividad */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-lg">Tasa de Actividad</h3>
              <span className="font-bold text-blue-600">{stats.actividad}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
              <div className="bg-green-500 h-3 rounded-full" style={{ width: `${stats.actividad}%` }}></div>
            </div>
            <p className="text-xs text-gray-500">{Math.round((stats.actividad / 100) * stats.usuarios)} de {stats.usuarios} usuarios activos</p>
          </div>

          {/* Indicadores de Desempeño */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Indicadores de Desempeño</h2>
            <div className="space-y-3">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Tasa de Completitud</h4>
                    <p className="text-xs text-gray-500">Cursos finalizados</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-600">75%</span>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Tiempo Promedio</h4>
                    <p className="text-xs text-gray-500">Por capacitación</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-blue-600">4.2h</span>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Tasa de Aprobación</h4>
                    <p className="text-xs text-gray-500">Primer intento</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-purple-600">82%</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}