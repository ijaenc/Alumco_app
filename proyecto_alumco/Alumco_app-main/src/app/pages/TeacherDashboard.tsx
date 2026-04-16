import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LogOut, BookOpen, Users, MessageSquare, PlusCircle, 
  X, Loader2, UploadCloud, FileText, CheckCircle, 
  Video, HelpCircle, Save, ArrowLeft, Edit3, TrendingUp, BarChart 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

// ── VISTA DE CREACIÓN DE CURSO Y EVALUACIÓN ──────────────────────────────────
function CreateCourseView({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  
  // Datos del Curso
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [modules, setModules] = useState([{ id: 1, title: '', type: 'video', content: null }]);
  const [questions, setQuestions] = useState([{ id: 1, text: '', options: ['', ''], correct: 0 }]);

  const handleSaveCourse = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error('El título y la descripción son obligatorios');
      return;
    }
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Curso "${title}" creado y publicado exitosamente`);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar el curso');
    } finally {
      setSaving(false);
    }
  };

  const addModule = () => setModules([...modules, { id: Date.now(), title: '', type: 'video', content: null }]);
  const addQuestion = () => setQuestions([...questions, { id: Date.now(), text: '', options: ['', ''], correct: 0 }]);
  const addOptionToQuestion = (qId: number) => {
    setQuestions(questions.map(q => q.id === qId ? { ...q, options: [...q.options, ''] } : q));
  };

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto animate-in slide-in-from-bottom-4">
      {/* Header Fijo */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Crear Nueva Capacitación</h2>
            <p className="text-sm text-gray-500">
              {step === 1 ? 'Paso 1: Información General' : step === 2 ? 'Paso 2: Contenido y Módulos' : 'Paso 3: Evaluación Final'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 mr-4">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-orange-600' : 'bg-gray-200'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-orange-600' : 'bg-gray-200'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-orange-600' : 'bg-gray-200'}`}></div>
          </div>
          {step > 1 && <Button variant="outline" onClick={() => setStep(step - 1)}>Atrás</Button>}
          {step < 3 ? (
            <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={() => setStep(step + 1)}>Continuar</Button>
          ) : (
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSaveCourse} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Publicar Curso
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto py-8 px-4">
        {/* PASO 1: Datos Generales */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-orange-600" /> Detalles de la Capacitación
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Título del Curso</Label>
                  <Input placeholder="Ej: Introducción a los Derechos Humanos" value={title} onChange={e => setTitle(e.target.value)} className="bg-gray-50 h-12" />
                </div>
                <div className="space-y-2">
                  <Label>Descripción Completa</Label>
                  <textarea 
                    placeholder="Describe los objetivos y lo que aprenderán los alumnos..." 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASO 2: Módulos de Contenido */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Video className="w-5 h-5 text-orange-600" /> Módulos del Curso
              </h3>
              <Button variant="outline" className="text-orange-600 border-orange-200" onClick={addModule}>
                <PlusCircle className="w-4 h-4 mr-2" /> Agregar Módulo
              </Button>
            </div>

            {modules.map((mod, index) => (
              <div key={mod.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-slate-700">Módulo {index + 1}</h4>
                  <button className="text-red-500 hover:bg-red-50 p-2 rounded-lg" onClick={() => setModules(modules.filter(m => m.id !== mod.id))}><X className="w-4 h-4"/></button>
                </div>
                <div className="space-y-4">
                  <Input placeholder="Título del módulo (Ej: Conceptos Básicos)" className="bg-gray-50" />
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-24 flex flex-col gap-2 bg-gray-50 hover:bg-orange-50 hover:border-orange-200">
                      <Video className="w-6 h-6 text-orange-600" /> Subir Video
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col gap-2 bg-gray-50 hover:bg-orange-50 hover:border-orange-200">
                      <FileText className="w-6 h-6 text-orange-600" /> Subir PDF / Lectura
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PASO 3: Evaluación */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
             <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-orange-600" /> Evaluación Final
                </h3>
                <p className="text-sm text-gray-500 mt-1">Crea las preguntas para aprobar el curso.</p>
              </div>
              <Button variant="outline" className="text-orange-600 border-orange-200" onClick={addQuestion}>
                <PlusCircle className="w-4 h-4 mr-2" /> Nueva Pregunta
              </Button>
            </div>

            {questions.map((q, qIndex) => (
              <div key={q.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-orange-100 text-orange-700 font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    {qIndex + 1}
                  </span>
                  <button className="text-red-500 hover:bg-red-50 p-2 rounded-lg" onClick={() => setQuestions(questions.filter(quest => quest.id !== q.id))}><X className="w-4 h-4"/></button>
                </div>
                
                <div className="space-y-4">
                  <Input placeholder="Escribe la pregunta aquí..." className="font-medium bg-gray-50" />
                  
                  <div className="space-y-2 pl-4 border-l-2 border-orange-100">
                    <Label className="text-xs text-gray-500 uppercase tracking-wider">Alternativas (Marca la correcta)</Label>
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name={`correct-${q.id}`} 
                          className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                          defaultChecked={oIndex === 0}
                        />
                        <Input placeholder={`Opción ${oIndex + 1}`} className="bg-white" />
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" className="text-orange-600 mt-2" onClick={() => addOptionToQuestion(q.id)}>
                      + Agregar otra opción
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}


// ── PÁGINA PRINCIPAL DEL PROFESOR ──────────────────────────────────────────────
export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);

  if (isCreatingCourse) {
    return <CreateCourseView onClose={() => setIsCreatingCourse(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-800">
      
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 border border-gray-200 shadow-sm">
               <img 
                 src="/logo.png" 
                 alt="Logo" 
                 className="w-full h-full object-cover"
                 onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
               />
            </div>
            Portal Docente
          </h1>
          <p className="text-sm text-slate-500">Centro de Creación y Gestión de Cursos</p>
        </div>
        
        <button 
          onClick={() => navigate("/")} 
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm text-sm font-bold"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Banner de Bienvenida */}
        <div className="bg-orange-600 rounded-3xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 right-32 w-32 h-32 bg-white opacity-5 rounded-full translate-y-1/2"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">¡Hola, {user?.name || 'Profesor'}! 👨‍🏫</h2>
            <p className="text-orange-100 text-sm md:text-base">Tu centro de mando para crear capacitaciones y evaluar a tus estudiantes.</p>
          </div>

          <Button 
            onClick={() => setIsCreatingCourse(true)}
            className="relative z-10 bg-white text-orange-600 hover:bg-orange-50 font-bold rounded-xl shadow-md h-12 px-6 transition-transform hover:scale-105"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Crear Capacitación y Evaluación
          </Button>
        </div>

        {/* NUEVO: MINI RESUMEN (TARJETAS DE ESTADÍSTICAS) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Tarjeta 1: Capacitaciones */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800">3</p>
              <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">Capacitaciones</p>
            </div>
          </div>

          {/* Tarjeta 2: Estudiantes */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800">135</p>
              <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">Estudiantes Totales</p>
            </div>
          </div>

          {/* Tarjeta 3: Tasa Completado */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800">78%</p>
              <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">Tasa Completado</p>
            </div>
          </div>

          {/* Tarjeta 4: Promedio */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-yellow-50 text-yellow-500 rounded-2xl flex items-center justify-center">
              <BarChart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800">8.5</p>
              <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">Promedio Calificación</p>
            </div>
          </div>

        </div>

        {/* Accesos Rápidos para el Profesor */}
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-4 mt-2">Tus Herramientas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            
            {/* CREADOR DE CURSOS */}
            <button onClick={() => setIsCreatingCourse(true)} className="block w-full text-left no-underline group">
              <div className="bg-white h-full p-6 rounded-3xl border border-orange-200 shadow-sm hover:shadow-md transition-all ring-2 ring-transparent hover:ring-orange-500/20">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-orange-50 text-orange-600 group-hover:scale-110 transition-transform">
                    <Edit3 className="w-6 h-6" />
                  </div>
                  <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Nuevo</span>
                </div>
                <h4 className="font-bold text-slate-800 text-lg mb-1">Creador de Cursos</h4>
                <p className="text-sm text-slate-500">Arma tus módulos, sube material y crea las preguntas de evaluación.</p>
              </div>
            </button>

            {/* MIS CURSOS ACTIVOS */}
            <Link to="/teacher/courses" className="block no-underline group">
              <div className="bg-white h-full p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform bg-purple-50 text-purple-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-lg mb-1">Mis Cursos Activos</h4>
                <p className="text-sm text-slate-500">Edita contenido existente y revisa las certificaciones otorgadas.</p>
              </div>
            </Link>

            {/* PROGRESO DE ALUMNOS */}
            <Link to="/teacher/students" className="block no-underline group">
              <div className="bg-white h-full p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform bg-blue-50 text-blue-600">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-lg mb-1">Progreso de Alumnos</h4>
                <p className="text-sm text-slate-500">Revisa las calificaciones y el avance de los inscritos.</p>
              </div>
            </Link>

            {/* NUEVO: MENSAJERÍA (GMAIL STYLE) */}
            <Link to="/teacher/messages" className="block no-underline group">
              <div className="bg-white h-full p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform bg-teal-50 text-teal-600">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-lg mb-1">Mensajería</h4>
                <p className="text-xs text-slate-500">Envía correos y archivos a tus alumnos.</p>
              </div>
            </Link>

          </div>
        </div>

          </div>
        </div>
  );
}