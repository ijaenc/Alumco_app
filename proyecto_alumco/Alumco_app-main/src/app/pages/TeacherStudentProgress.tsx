import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Mail, AlertTriangle, 
  Award, TrendingUp, Download, BookOpen, MapPin, Users
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

// --- DATOS DE PRUEBA DE ALUMNOS (Ahora con Sedes) ---
const estudiantes = [
  { id: 1, nombre: 'María González', email: 'maria.g@email.com', sede: 'Santiago', cursos: 3, completados: 3, promedio: 95, ultimaVez: 'Hace 2 horas', estado: 'Excelente', riesgo: false },
  { id: 2, nombre: 'Juan Pérez', email: 'juan.p@email.com', sede: 'Valparaíso', cursos: 2, completados: 1, promedio: 78, ultimaVez: 'Hace 1 día', estado: 'Regular', riesgo: false },
  { id: 3, nombre: 'Carlos Ruiz', email: 'carlos.r@email.com', sede: 'Santiago', cursos: 2, completados: 0, promedio: 45, ultimaVez: 'Hace 3 semanas', estado: 'En Peligro', riesgo: true },
  { id: 4, nombre: 'Ana Martínez', email: 'ana.m@email.com', sede: 'Concepción', cursos: 4, completados: 2, promedio: 88, ultimaVez: 'Hace 5 horas', estado: 'Bueno', riesgo: false },
  { id: 5, nombre: 'Felipe Marín', email: 'felipe.m@email.com', sede: 'Valparaíso', cursos: 1, completados: 0, promedio: 0, ultimaVez: 'Nunca', estado: 'Inactivo', riesgo: true },
];

const sedesDisponibles = ['Todas', 'Santiago', 'Valparaíso', 'Concepción'];

export default function TeacherStudentProgress() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [sedeSeleccionada, setSedeSeleccionada] = useState('Todas');

  // Filtramos la lista según el buscador Y la sede seleccionada
  const estudiantesFiltrados = estudiantes.filter(est => {
    const coincideBusqueda = est.nombre.toLowerCase().includes(busqueda.toLowerCase()) || est.email.toLowerCase().includes(busqueda.toLowerCase());
    const coincideSede = sedeSeleccionada === 'Todas' || est.sede === sedeSeleccionada;
    return coincideBusqueda && coincideSede;
  });

  // Cálculos matemáticos en vivo para las tarjetas de arriba
  const totalAlumnos = estudiantesFiltrados.length;
  const promedioGeneral = totalAlumnos > 0 ? (estudiantesFiltrados.reduce((acc, est) => acc + est.promedio, 0) / totalAlumnos).toFixed(1) : 0;
  
  const cursosTotales = estudiantesFiltrados.reduce((acc, est) => acc + est.cursos, 0);
  const completadosTotales = estudiantesFiltrados.reduce((acc, est) => acc + est.completados, 0);
  const tasaCompletacion = cursosTotales > 0 ? Math.round((completadosTotales / cursosTotales) * 100) : 0;
  
  const alumnosEnRiesgo = estudiantesFiltrados.filter(est => est.riesgo).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      
      {/* Header Fijo */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-gray-500 hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Rendimiento Global</h1>
            <p className="text-sm text-gray-500">Monitorea a todos tus estudiantes inscritos</p>
          </div>
        </div>
        <Button variant="outline" className="flex items-center gap-2 bg-white rounded-xl shadow-sm border-gray-200 text-blue-600 hover:bg-blue-50">
          <Download className="w-4 h-4" /> Exportar Reporte
        </Button>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-8 space-y-6">
        
        {/* Tarjetas de Resumen Global (AHORA SON DINÁMICAS) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Users className="w-6 h-6" /></div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 mb-1">Total Alumnos</p>
              <p className="text-3xl font-bold text-slate-800">{totalAlumnos}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><Award className="w-6 h-6" /></div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 mb-1">Promedio General</p>
              <p className="text-3xl font-bold text-slate-800">{promedioGeneral}%</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><TrendingUp className="w-6 h-6" /></div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 mb-1">Tasa de Finalización</p>
              <p className="text-3xl font-bold text-slate-800">{tasaCompletacion}%</p>
            </div>
          </div>

          <div className="bg-red-50 p-6 rounded-3xl border border-red-100 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all">
            <div className="absolute -right-4 -top-4 opacity-10"><AlertTriangle className="w-32 h-32 text-red-600" /></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-red-100 text-red-600 rounded-2xl"><AlertTriangle className="w-6 h-6" /></div>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-red-600 mb-1">Alumnos en Riesgo</p>
              <p className="text-3xl font-bold text-red-700">{alumnosEnRiesgo}</p>
            </div>
          </div>
        </div>

        {/* Buscador y Tabla */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          
          {/* Barra de herramientas */}
          <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
            
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              {/* Buscador de texto */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Buscar por nombre o correo..." 
                  className="pl-10 bg-white border-gray-200 h-11 rounded-xl" 
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              {/* NUEVO: Filtro por Sede */}
              <div className="relative w-full md:w-48">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <select 
                  className="w-full pl-10 pr-4 h-11 bg-white border border-gray-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none"
                  value={sedeSeleccionada}
                  onChange={(e) => setSedeSeleccionada(e.target.value)}
                >
                  {sedesDisponibles.map(s => (
                    <option key={s} value={s}>{s === 'Todas' ? 'Todas las Sedes' : `Sede ${s}`}</option>
                  ))}
                </select>
                {/* Flechita del select */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

          </div>
          
          {/* Lista de Estudiantes */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                  <th className="p-5">Estudiante</th>
                  <th className="p-5">Sede</th>
                  <th className="p-5 text-center">Cursos</th>
                  <th className="p-5 text-center">Promedio</th>
                  <th className="p-5">Última Actividad</th>
                  <th className="p-5 text-center">Estado</th>
                  <th className="p-5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {estudiantesFiltrados.map(est => (
                  <tr key={est.id} className="hover:bg-gray-50 transition-colors group">
                    
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${est.riesgo ? 'bg-red-100 text-red-600' : 'bg-slate-800 text-white'}`}>
                          {est.nombre.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            {est.nombre}
                            {est.riesgo && <AlertTriangle className="w-3.5 h-3.5 text-red-500 fill-red-100" />}
                          </p>
                          <p className="text-xs text-gray-500">{est.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Nueva Columna de Sede */}
                    <td className="p-5">
                      <span className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {est.sede}
                      </span>
                    </td>

                    <td className="p-5 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-slate-700 text-sm">{est.completados} / {est.cursos}</span>
                        <span className="text-[10px] text-gray-400 uppercase font-bold">Completados</span>
                      </div>
                    </td>

                    <td className="p-5 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        est.promedio >= 90 ? 'bg-green-100 text-green-700' : 
                        est.promedio >= 70 ? 'bg-blue-100 text-blue-700' : 
                        est.promedio > 0 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {est.promedio > 0 ? `${est.promedio}%` : 'N/A'}
                      </span>
                    </td>

                    <td className="p-5 text-sm text-gray-500 font-medium">
                      {est.ultimaVez}
                    </td>

                    <td className="p-5 text-center">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${est.riesgo ? 'text-red-500' : 'text-slate-500'}`}>
                        {est.estado}
                      </span>
                    </td>

                    <td className="p-5 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:bg-blue-50 rounded-lg" title="Ver Detalle">
                          <BookOpen className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-orange-600 hover:bg-orange-50 rounded-lg" title="Enviar Correo">
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>

            {estudiantesFiltrados.length === 0 && (
              <div className="p-10 text-center text-gray-500 flex flex-col items-center justify-center">
                <MapPin className="w-8 h-8 text-gray-300 mb-2" />
                <p>No hay alumnos registrados en esta sede.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}