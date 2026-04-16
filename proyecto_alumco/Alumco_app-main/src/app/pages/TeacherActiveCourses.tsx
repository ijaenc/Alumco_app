import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Users, CheckCircle, Clock, 
  Edit3, Video, FileText, Save, UploadCloud, Trash2, Award
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

// --- DATOS DE PRUEBA (Mock Data) ---
const cursosActivos = [
  { id: 1, titulo: 'Derechos Humanos Fundamentales', desc: 'Introducción a los derechos básicos', modulos: 8, semanas: 4, alumnos: 45, completados: 32, progreso: 71 },
  { id: 2, titulo: 'Gestión de Proyectos Sociales', desc: 'Planificación y ejecución efectiva', modulos: 6, semanas: 3, alumnos: 38, completados: 28, progreso: 74 },
];

const alumnosProgreso = [
  { id: 1, nombre: 'María González', email: 'maria.g@email.com', modulos: '8/8', porcentaje: 100, estado: 'Completado', nota: 95, color: 'bg-green-50 text-green-700' },
  { id: 2, nombre: 'Juan Pérez', email: 'juan.p@email.com', modulos: '6/8', porcentaje: 75, estado: 'En Progreso', nota: 68, color: 'bg-orange-50 text-orange-700' },
  { id: 3, nombre: 'Ana Martínez', email: 'ana.m@email.com', modulos: '2/8', porcentaje: 25, estado: 'En Progreso', nota: null, color: 'bg-orange-50 text-orange-700' },
  { id: 4, nombre: 'Carlos Ruiz', email: 'carlos.r@email.com', modulos: '0/8', porcentaje: 0, estado: 'No Iniciado', nota: null, color: 'bg-gray-100 text-gray-600' },
];

export default function TeacherActiveCourses() {
  const navigate = useNavigate();
  const [vista, setVista] = useState<'lista' | 'progreso' | 'editar'>('lista');
  const [cursoSeleccionado, setCursoSeleccionado] = useState<any>(null);
  
  // Estados para los filtros de alumnos
  const [filtro, setFiltro] = useState('Todos');
  const [ordenarPorNota, setOrdenarPorNota] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  // Estado para la lista de archivos en la vista de Editar
  const [archivos, setArchivos] = useState([
    { id: 1, nombre: 'Módulo 1: Introducción.mp4', tipo: 'video' },
    { id: 2, nombre: 'Lectura Obligatoria.pdf', tipo: 'pdf' },
    { id: 3, nombre: 'Guía de Ejercicios.docx', tipo: 'doc' },
  ]);

  // Funciones de navegación
  const irAProgreso = (curso: any) => { setCursoSeleccionado(curso); setVista('progreso'); setFiltro('Todos'); setOrdenarPorNota(false); };
  const irAEditar = (curso: any) => { setCursoSeleccionado(curso); setVista('editar'); };
  const volverALista = () => { setCursoSeleccionado(null); setVista('lista'); };

  // Función mágica para atrapar el archivo subido
  const handleSubirArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const archivoSubido = e.target.files[0];
      
      // Detectamos si es video, pdf o documento general para pintarlo bonito
      let tipoAsignado = 'doc';
      if (archivoSubido.type.includes('video')) tipoAsignado = 'video';
      else if (archivoSubido.type.includes('pdf')) tipoAsignado = 'pdf';

      const nuevoArchivo = {
        id: Date.now(), // Un ID único
        nombre: archivoSubido.name,
        tipo: tipoAsignado
      };

      // Lo agregamos a la lista de archivos que se ven en pantalla
      setArchivos([...archivos, nuevoArchivo]);
    }
  };

  // Función para eliminar un archivo de la lista
  const eliminarArchivo = (id: number) => {
    setArchivos(archivos.filter(a => a.id !== id));
  };


  // ==========================================
  // PANTALLA 1: LISTA DE CURSOS
  // ==========================================
  if (vista === 'lista') {
    return (
      <div className="min-h-screen bg-gray-50 pb-10">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-gray-500 hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Mis Capacitaciones Activas</h1>
              <p className="text-sm text-gray-500">Gestiona tus cursos y evalúa a tus alumnos</p>
            </div>
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-sm">
            Crear Nueva
          </Button>
        </header>

        <main className="max-w-4xl mx-auto px-6 mt-8 space-y-6">
          {cursosActivos.map(curso => (
            <div key={curso.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{curso.titulo}</h3>
                  <p className="text-gray-500">{curso.desc}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 mb-6 text-sm font-medium text-slate-600">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg"><FileText className="w-4 h-4 text-orange-500" /> {curso.modulos} Módulos</div>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg"><Clock className="w-4 h-4 text-orange-500" /> {curso.semanas} Semanas</div>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg"><Users className="w-4 h-4 text-orange-500" /> {curso.alumnos} Alumnos</div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                  <span>Progreso General</span>
                  <span>{curso.progreso}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${curso.progreso}%` }}></div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl text-orange-600 border-orange-200 hover:bg-orange-50" onClick={() => irAProgreso(curso)}>
                  <Users className="w-4 h-4 mr-2" /> Ver Progreso
                </Button>
                <Button variant="outline" className="flex-1 rounded-xl text-slate-600 border-gray-200 hover:bg-gray-50" onClick={() => irAEditar(curso)}>
                  <Edit3 className="w-4 h-4 mr-2" /> Editar Curso
                </Button>
              </div>
            </div>
          ))}
        </main>
      </div>
    );
  }

  // ==========================================
  // PANTALLA 2: PROGRESO DE ESTUDIANTES
  // ==========================================
  if (vista === 'progreso') {
    let alumnosMostrados = alumnosProgreso.filter(alumno => {
      if (busqueda && !alumno.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false;
      if (filtro !== 'Todos' && alumno.estado !== filtro) return false;
      return true;
    });

    if (ordenarPorNota) {
      alumnosMostrados.sort((a, b) => (b.nota || 0) - (a.nota || 0));
    }

    return (
      <div className="min-h-screen bg-gray-50 pb-10">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10 px-6 py-4">
          <div className="flex items-center gap-4 max-w-5xl mx-auto">
            <Button variant="ghost" size="icon" onClick={volverALista} className="text-gray-500 hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Progreso de Estudiantes</h1>
              <p className="text-sm text-orange-600 font-medium">{cursoSeleccionado?.titulo}</p>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 mt-8 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div onClick={() => { setFiltro('Todos'); setOrdenarPorNota(false); }} className={`bg-white p-5 rounded-2xl border ${filtro === 'Todos' && !ordenarPorNota ? 'border-blue-400 shadow-md' : 'border-gray-100 shadow-sm hover:border-blue-200'} flex items-center gap-4 cursor-pointer transition-all`}>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Users className="w-6 h-6" /></div>
              <div><p className="text-sm text-gray-500">Total Alumnos</p><p className="text-2xl font-bold text-slate-800">45</p></div>
            </div>
            
            <div onClick={() => { setFiltro('Completado'); setOrdenarPorNota(false); }} className={`bg-white p-5 rounded-2xl border ${filtro === 'Completado' ? 'border-green-400 shadow-md' : 'border-gray-100 shadow-sm hover:border-green-200'} flex items-center gap-4 cursor-pointer transition-all`}>
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><CheckCircle className="w-6 h-6" /></div>
              <div><p className="text-sm text-gray-500">Completados</p><p className="text-2xl font-bold text-slate-800">32</p></div>
            </div>
            
            <div onClick={() => { setFiltro('En Progreso'); setOrdenarPorNota(false); }} className={`bg-white p-5 rounded-2xl border ${filtro === 'En Progreso' ? 'border-orange-400 shadow-md' : 'border-gray-100 shadow-sm hover:border-orange-200'} flex items-center gap-4 cursor-pointer transition-all`}>
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center"><Clock className="w-6 h-6" /></div>
              <div><p className="text-sm text-gray-500">En Progreso</p><p className="text-2xl font-bold text-slate-800">11</p></div>
            </div>
            
            <div onClick={() => { setOrdenarPorNota(!ordenarPorNota); setFiltro('Todos'); }} className={`bg-white p-5 rounded-2xl border ${ordenarPorNota ? 'border-purple-400 shadow-md' : 'border-gray-100 shadow-sm hover:border-purple-200'} flex items-center gap-4 cursor-pointer transition-all`}>
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><Award className="w-6 h-6" /></div>
              <div><p className="text-sm text-gray-500">Promedio</p><p className="text-2xl font-bold text-slate-800">91.7</p></div>
            </div>
          </div>

          <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
            {['Todos', 'Completado', 'En Progreso', 'No Iniciado'].map(tab => (
              <button 
                key={tab}
                onClick={() => { setFiltro(tab); setOrdenarPorNota(false); }}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap ${
                  filtro === tab && !ordenarPorNota ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {tab === 'Completado' ? 'Completados' : tab === 'No Iniciado' ? 'No Iniciados' : tab}
              </button>
            ))}
            {ordenarPorNota && (
              <button className="px-4 py-2 rounded-full text-sm font-bold bg-purple-600 text-white shadow-sm whitespace-nowrap">
                Ordenado por Nota
              </button>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Buscar estudiante..." 
                  className="pl-10 bg-gray-50" 
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>
            
            <div className="divide-y divide-gray-50">
              {alumnosMostrados.length > 0 ? (
                alumnosMostrados.map(alumno => (
                  <div key={alumno.id} className="p-4 hover:bg-gray-50 flex items-center gap-4 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {alumno.nombre.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 text-sm">{alumno.nombre}</h4>
                      <p className="text-xs text-gray-500">{alumno.email}</p>
                    </div>
                    <div className="flex-1 hidden md:block">
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>{alumno.modulos} módulos</span>
                        <span>{alumno.porcentaje}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${alumno.porcentaje === 100 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${alumno.porcentaje}%` }}></div>
                      </div>
                    </div>
                    <div className="w-24 md:w-32 text-right">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${alumno.color}`}>
                        {alumno.estado}
                      </span>
                      {alumno.nota && <p className="text-xs font-bold text-slate-800 mt-1">Nota: {alumno.nota}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>No se encontraron alumnos con este filtro.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // PANTALLA 3: EDITAR CAPACITACIÓN 
  // ==========================================
  if (vista === 'editar') {
    return (
      <div className="min-h-screen bg-gray-50 pb-10">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={volverALista} className="text-gray-500 hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Editar Capacitación</h1>
              <p className="text-sm text-gray-500">Actualiza los detalles y el material</p>
            </div>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm" onClick={volverALista}>
            <Save className="w-4 h-4 mr-2" /> Guardar
          </Button>
        </header>

        <main className="max-w-3xl mx-auto px-6 mt-8 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Título de la Capacitación</label>
              <Input defaultValue={cursoSeleccionado?.titulo} className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Descripción</label>
              <textarea defaultValue={cursoSeleccionado?.desc} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Duración estimada</label>
              <Input defaultValue={`${cursoSeleccionado?.semanas} semanas`} className="bg-gray-50" />
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-blue-600" /> Material del Curso
              </h3>
              
              {/* EL BOTÓN MÁGICO QUE ABRE LOS ARCHIVOS */}
              <div className="relative">
                <input 
                  type="file" 
                  id="subir-archivo" 
                  className="hidden" 
                  onChange={handleSubirArchivo}
                  accept="video/*,.pdf,.doc,.docx,.ppt,.pptx" // Acepta videos y documentos
                />
                <label 
                  htmlFor="subir-archivo" 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium border border-blue-200 bg-transparent hover:bg-blue-50 text-blue-600 h-10 px-4 py-2 cursor-pointer transition-colors"
                >
                  <UploadCloud className="w-4 h-4 mr-2"/> Subir Archivo
                </label>
              </div>

            </div>
            
            <div className="space-y-3">
              {archivos.map(archivo => (
                <div key={archivo.id} className={`flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl transition-colors hover:border-${archivo.tipo === 'video' ? 'blue' : archivo.tipo === 'pdf' ? 'red' : 'green'}-200`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${archivo.tipo === 'video' ? 'bg-blue-100 text-blue-600' : archivo.tipo === 'pdf' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {archivo.tipo === 'video' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <span className="font-bold text-sm text-slate-700 truncate max-w-[200px] sm:max-w-xs">{archivo.nombre}</span>
                  </div>
                  <button 
                    onClick={() => eliminarArchivo(archivo.id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {archivos.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No hay archivos subidos aún. Empieza agregando el material del curso.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return null;
}