import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import FileUploader from "../components/FileUploader";
import {
  ArrowLeft, Plus, FileText, Users, Trash2, Edit,
  Send, Loader2, BookOpen, Clock, CheckCircle,
  X, GripVertical, Save, Link,
} from "lucide-react";
import { courseService, type Course } from "../services/courseService";
import { evaluationService } from "../services/evaluationService";
import { adminService, type StudentSummary } from "../services/adminService";
import type { UploadResult } from "../services/storageService";
import { toast } from "sonner";

interface QuestionDraft {
  id: string;
  text: string;
  options: { text: string; is_correct: boolean }[];
}

interface ModuleDraft {
  title: string;
  type: "video" | "document" | "text";
  duration: string;
  content_url: string;
  useUpload: boolean;
}

export default function AdminPanel() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Formulario curso
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseImageUrl, setCourseImageUrl] = useState("");
  const [courseImageUploaded, setCourseImageUploaded] = useState<UploadResult | null>(null);
  const [courseDuration, setCourseDuration] = useState("");
  const [courseStatus, setCourseStatus] = useState<"draft" | "published">("published");
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");

  // Módulos
  const [modules, setModules] = useState<ModuleDraft[]>([]);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [newModule, setNewModule] = useState<ModuleDraft>({
    title: "", type: "video", duration: "", content_url: "", useUpload: false,
  });
  const [newModuleUpload, setNewModuleUpload] = useState<UploadResult | null>(null);

  // Evaluación
  const [withEval, setWithEval] = useState(false);
  const [evalTitle, setEvalTitle] = useState("");
  const [evalPassScore, setEvalPassScore] = useState(70);
  const [evalTimeLimit, setEvalTimeLimit] = useState(30);
  const [evalMaxAttempts, setEvalMaxAttempts] = useState(2);
  const [evalWaitDays, setEvalWaitDays] = useState(14);
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);

  // Asignación
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([courseService.getAll(), adminService.getStudents()])
      .then(([c, s]) => { setCourses(c); setStudents(s); })
      .catch(() => toast.error("Error cargando datos"))
      .finally(() => setLoading(false));
  }, []);

  const addModule = () => {
    if (!newModule.title.trim()) { toast.error("El módulo necesita un título"); return; }
    const url = newModule.useUpload ? (newModuleUpload?.url || "") : newModule.content_url;
    setModules([...modules, { ...newModule, content_url: url }]);
    setNewModule({ title: "", type: "video", duration: "", content_url: "", useUpload: false });
    setNewModuleUpload(null);
    setShowModuleForm(false);
    toast.success("Módulo agregado");
  };

  const removeModule = (index: number) => setModules(modules.filter((_, i) => i !== index));

  const addQuestion = () => {
    setQuestions([...questions, {
      id: Date.now().toString(), text: "",
      options: [
        { text: "", is_correct: false }, { text: "", is_correct: false },
        { text: "", is_correct: false }, { text: "", is_correct: false },
      ],
    }]);
  };

  const updateQuestion = (qi: number, text: string) => {
    const u = [...questions]; u[qi].text = text; setQuestions(u);
  };

  const updateOption = (qi: number, oi: number, text: string) => {
    const u = [...questions]; u[qi].options[oi].text = text; setQuestions(u);
  };

  const setCorrectOption = (qi: number, oi: number) => {
    const u = [...questions];
    u[qi].options = u[qi].options.map((o, i) => ({ ...o, is_correct: i === oi }));
    setQuestions(u);
  };

  const removeQuestion = (qi: number) => setQuestions(questions.filter((_, i) => i !== qi));

  const handleCreateCourse = async () => {
    if (!courseTitle.trim() || !courseDescription.trim()) {
      toast.error("El título y la descripción son obligatorios"); return;
    }
    if (withEval) {
      if (!evalTitle.trim()) { toast.error("La evaluación necesita un título"); return; }
      if (questions.length === 0) { toast.error("Agrega al menos una pregunta"); return; }
      for (const q of questions) {
        if (!q.text.trim()) { toast.error("Todas las preguntas necesitan texto"); return; }
        if (!q.options.some(o => o.is_correct)) { toast.error(`La pregunta "${q.text}" necesita una respuesta correcta`); return; }
        if (q.options.some(o => !o.text.trim())) { toast.error("Todas las opciones deben tener texto"); return; }
      }
    }

    setSaving(true);
    try {
      const imageUrl = imageMode === "upload" ? courseImageUploaded?.url : courseImageUrl;

      const newCourse = await courseService.create({
        title: courseTitle,
        description: courseDescription,
        image_url: imageUrl || undefined,
        duration: courseDuration || undefined,
        status: courseStatus,
      });

      for (let i = 0; i < modules.length; i++) {
        await courseService.addModule(newCourse.id, {
          title: modules[i].title,
          type: modules[i].type,
          duration: modules[i].duration || undefined,
          content_url: modules[i].content_url || undefined,
          order_index: i,
        });
      }

      if (withEval) {
        await evaluationService.create({
          course_id: newCourse.id,
          title: evalTitle,
          time_limit_min: evalTimeLimit,
          passing_score: evalPassScore,
          max_attempts: evalMaxAttempts,
          wait_days: evalWaitDays,
          questions: questions.map((q, i) => ({
            text: q.text, order_index: i,
            options: q.options.map((o, j) => ({ text: o.text, is_correct: o.is_correct, order_index: j })),
          })),
        });
      }

      setCourses(prev => [newCourse, ...prev]);
      setCourseTitle(""); setCourseDescription(""); setCourseImageUrl("");
      setCourseImageUploaded(null); setCourseDuration(""); setImageMode("url");
      setModules([]); setWithEval(false); setEvalTitle(""); setQuestions([]);
      toast.success(`¡Curso "${newCourse.title}" creado exitosamente!`);
    } catch (err: any) {
      toast.error(err.message || "Error al crear el curso");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (courseId: string, title: string) => {
    if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return;
    try {
      await courseService.delete(courseId);
      setCourses(prev => prev.filter(c => c.id !== courseId));
      toast.success("Curso eliminado");
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar");
    }
  };

  const handleAssign = async () => {
    if (!selectedCourseId || selectedStudentIds.length === 0) {
      toast.error("Selecciona un curso y al menos un estudiante"); return;
    }
    setSaving(true);
    let ok = 0;
    for (const studentId of selectedStudentIds) {
      try { await courseService.enrollStudent(selectedCourseId, studentId); ok++; } catch { }
    }
    setSaving(false);
    if (ok > 0) toast.success(`${ok} estudiante${ok !== 1 ? "s" : ""} inscrito${ok !== 1 ? "s" : ""}`);
    else toast.info("Los estudiantes ya estaban inscritos");
    setSelectedStudentIds([]);
  };

  const toggleStudent = (id: string) =>
    setSelectedStudentIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const getModuleCategory = (type: string) =>
    type === "video" ? "videos" : "documents";

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")} className="text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900">Panel de Control</h2>
            <p className="text-xs text-gray-500">Gestión completa de la plataforma</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-gray-100 mb-6">
            <TabsTrigger value="content" className="text-xs">Cursos</TabsTrigger>
            <TabsTrigger value="assign" className="text-xs">Asignar</TabsTrigger>
            <TabsTrigger value="users" className="text-xs">Usuarios</TabsTrigger>
          </TabsList>

          {/* CURSOS */}
          <TabsContent value="content" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Crear Nuevo Curso</h3>
                  <p className="text-xs text-gray-500">Completa la información del curso</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Título del Curso <span className="text-red-500">*</span></Label>
                  <Input placeholder="Ej: Introducción a los Derechos Humanos" value={courseTitle} onChange={e => setCourseTitle(e.target.value)} className="bg-gray-50" />
                </div>

                <div className="space-y-2">
                  <Label>Descripción (min. 10 cracteres)<span className="text-red-500">*</span></Label>
                  <Textarea placeholder="Describe el contenido y objetivos del curso..." value={courseDescription} onChange={e => setCourseDescription(e.target.value)} className="bg-gray-50 min-h-[100px]" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label><Clock className="w-3 h-3 inline mr-1" />Duración</Label>
                    <Input placeholder="Ej: 2h 30min" value={courseDuration} onChange={e => setCourseDuration(e.target.value)} className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <select className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm" value={courseStatus} onChange={e => setCourseStatus(e.target.value as any)}>
                      <option value="published">Publicado</option>
                      <option value="draft">Borrador</option>
                    </select>
                  </div>
                </div>

                {/* Imagen de portada */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Imagen de portada</Label>
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                      <button onClick={() => setImageMode("url")} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${imageMode === "url" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>
                        <Link className="w-3 h-3 inline mr-1" />URL
                      </button>
                      <button onClick={() => setImageMode("upload")} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${imageMode === "upload" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>
                        <Send className="w-3 h-3 inline mr-1" />Subir
                      </button>
                    </div>
                  </div>
                  {imageMode === "url" ? (
                    <>
                      <Input placeholder="https://..." value={courseImageUrl} onChange={e => setCourseImageUrl(e.target.value)} className="bg-gray-50" />
                      {courseImageUrl && (
                        <img src={courseImageUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg" onError={e => (e.currentTarget.style.display = "none")} />
                      )}
                    </>
                  ) : (
                    <FileUploader
                      category="images"
                      label=""
                      hint="Sube la imagen de portada del curso"
                      maxSizeMB={10}
                      onUpload={result => setCourseImageUploaded(result)}
                    />
                  )}
                </div>

                {/* Módulos */}
                <div className="border-t border-gray-100 pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-semibold">Módulos ({modules.length})</Label>
                    <Button size="sm" variant="outline" onClick={() => setShowModuleForm(!showModuleForm)}>
                      <Plus className="w-4 h-4 mr-1" />Agregar módulo
                    </Button>
                  </div>

                  {modules.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {modules.map((m, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{m.title}</p>
                            <p className="text-xs text-gray-500 capitalize">
                              {m.type}{m.duration ? ` · ${m.duration}` : ""}{m.content_url ? " · Contenido adjunto ✓" : ""}
                            </p>
                          </div>
                          <Button size="icon" variant="ghost" onClick={() => removeModule(i)} className="h-7 w-7 text-red-500 flex-shrink-0">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {showModuleForm && (
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-3">
                      <Input placeholder="Título del módulo" value={newModule.title} onChange={e => setNewModule({ ...newModule, title: e.target.value })} className="bg-white" />
                      <div className="grid grid-cols-2 gap-3">
                        <select className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm" value={newModule.type}
                          onChange={e => setNewModule({ ...newModule, type: e.target.value as any, useUpload: false, content_url: "" })}>
                          <option value="video">Video</option>
                          <option value="document">Documento</option>
                          <option value="text">Texto</option>
                        </select>
                        <Input placeholder="Duración (ej: 25 min)" value={newModule.duration} onChange={e => setNewModule({ ...newModule, duration: e.target.value })} className="bg-white" />
                      </div>

                      {newModule.type !== "text" && (
                        <div className="space-y-2">
                          <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-lg w-fit">
                            <button onClick={() => setNewModule({ ...newModule, useUpload: false })} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${!newModule.useUpload ? "bg-blue-100 text-blue-700" : "text-gray-500"}`}>
                              <Link className="w-3 h-3 inline mr-1" />URL
                            </button>
                            <button onClick={() => setNewModule({ ...newModule, useUpload: true })} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${newModule.useUpload ? "bg-blue-100 text-blue-700" : "text-gray-500"}`}>
                              <Send className="w-3 h-3 inline mr-1" />Subir archivo
                            </button>
                          </div>
                          {!newModule.useUpload ? (
                            <Input placeholder={newModule.type === "video" ? "https://youtube.com/... o URL del video" : "https://... URL del documento"} value={newModule.content_url} onChange={e => setNewModule({ ...newModule, content_url: e.target.value })} className="bg-white" />
                          ) : (
                            <FileUploader
                              category={getModuleCategory(newModule.type) as any}
                              label=""
                              hint={newModule.type === "video" ? "Sube el video (MP4, WebM)" : "Sube el documento (PDF, Word, PPT)"}
                              maxSizeMB={newModule.type === "video" ? 500 : 50}
                              onUpload={result => setNewModuleUpload(result)}
                            />
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button size="sm" onClick={addModule} className="bg-primary">
                          <CheckCircle className="w-4 h-4 mr-1" />Agregar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setShowModuleForm(false); setNewModuleUpload(null); }}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Evaluación */}
                <div className="border-t border-gray-100 pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-semibold">Evaluación Final</Label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs text-gray-600">Incluir evaluación</span>
                      <div onClick={() => setWithEval(!withEval)} className={`w-10 h-6 rounded-full transition-colors cursor-pointer ${withEval ? "bg-primary" : "bg-gray-300"}`}>
                        <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${withEval ? "translate-x-5" : "translate-x-1"}`} />
                      </div>
                    </label>
                  </div>

                  {withEval && (
                    <div className="space-y-4 p-4 bg-green-50 rounded-xl border border-green-200">
                      <Input placeholder="Título de la evaluación" value={evalTitle} onChange={e => setEvalTitle(e.target.value)} className="bg-white" />
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Nota mínima (%)", value: evalPassScore, set: setEvalPassScore, min: 1, max: 100 },
                          { label: "Tiempo límite (min)", value: evalTimeLimit, set: setEvalTimeLimit, min: 5, max: 180 },
                          { label: "Intentos máximos", value: evalMaxAttempts, set: setEvalMaxAttempts, min: 1, max: 5 },
                          { label: "Días de espera", value: evalWaitDays, set: setEvalWaitDays, min: 0, max: 60 },
                        ].map(f => (
                          <div key={f.label} className="space-y-1">
                            <Label className="text-xs">{f.label}</Label>
                            <Input type="number" min={f.min} max={f.max} value={f.value} onChange={e => f.set(Number(e.target.value))} className="bg-white" />
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-xs font-semibold">Preguntas ({questions.length})</Label>
                          <Button size="sm" variant="outline" onClick={addQuestion} className="h-7 text-xs">
                            <Plus className="w-3 h-3 mr-1" />Pregunta
                          </Button>
                        </div>
                        <div className="space-y-4">
                          {questions.map((q, qi) => (
                            <div key={q.id} className="p-4 bg-white rounded-xl border border-gray-200">
                              <div className="flex gap-2 mb-3">
                                <Input placeholder={`Pregunta ${qi + 1}`} value={q.text} onChange={e => updateQuestion(qi, e.target.value)} className="flex-1" />
                                <Button size="icon" variant="ghost" onClick={() => removeQuestion(qi)} className="h-10 w-10 text-red-500 flex-shrink-0">
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {q.options.map((opt, oi) => (
                                  <div key={oi} className="flex items-center gap-2">
                                    <button onClick={() => setCorrectOption(qi, oi)}
                                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${opt.is_correct ? "border-green-500 bg-green-500" : "border-gray-300 hover:border-green-400"}`}>
                                      {opt.is_correct && <div className="w-2 h-2 bg-white rounded-full" />}
                                    </button>
                                    <Input placeholder={`Opción ${oi + 1}`} value={opt.text} onChange={e => updateOption(qi, oi, e.target.value)} className={`flex-1 text-sm ${opt.is_correct ? "border-green-300 bg-green-50" : ""}`} />
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-gray-400 mt-2">● = respuesta correcta</p>
                            </div>
                          ))}
                          {questions.length === 0 && <p className="text-xs text-gray-500 text-center py-3">Agrega al menos una pregunta</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Button className="w-full h-12 bg-primary hover:bg-blue-600" onClick={handleCreateCourse} disabled={saving}>
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creando...</> : <><Save className="w-5 h-5 mr-2" />Crear Curso</>}
                </Button>
              </div>
            </Card>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Cursos Existentes ({courses.length})</h3>
              <div className="space-y-3">
                {courses.map(course => (
                  <Card key={course.id} className="p-4">
                    <div className="flex items-center gap-3">
                      {course.image_url ? (
                        <img src={course.image_url} alt={course.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">{course.title}</h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${course.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                            {course.status === "published" ? "Publicado" : "Borrador"}
                          </span>
                          {course.duration && <span className="text-xs text-gray-500">{course.duration}</span>}
                          {course.enrolled_students !== undefined && <span className="text-xs text-gray-500">{course.enrolled_students} estudiantes</span>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toast.info("Edición próximamente")}>
                          <Edit className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDeleteCourse(course.id, course.title)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                {courses.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>No hay cursos creados aún</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ASIGNAR */}
          <TabsContent value="assign" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Send className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Asignar Capacitación</h3>
                  <p className="text-xs text-gray-500">Inscribe estudiantes en cursos</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Seleccionar Curso</Label>
                  <select className="w-full h-12 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm" value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}>
                    <option value="">-- Selecciona un curso --</option>
                    {courses.filter(c => c.status === "published").map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Estudiantes ({selectedStudentIds.length} seleccionados)</Label>
                    <Button size="sm" variant="ghost" className="text-xs text-primary" onClick={() =>
                      setSelectedStudentIds(selectedStudentIds.length === students.length ? [] : students.map(s => s.id))
                    }>
                      {selectedStudentIds.length === students.length ? "Deseleccionar todos" : "Seleccionar todos"}
                    </Button>
                  </div>
                  <div className="border border-gray-200 rounded-lg bg-gray-50 max-h-64 overflow-y-auto">
                    {students.map(student => (
                      <label key={student.id} className={`flex items-center gap-3 p-3 hover:bg-white cursor-pointer border-b border-gray-100 last:border-0 ${selectedStudentIds.includes(student.id) ? "bg-blue-50" : ""}`}>
                        <input type="checkbox" className="w-4 h-4 accent-blue-600" checked={selectedStudentIds.includes(student.id)} onChange={() => toggleStudent(student.id)} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.email}</p>
                        </div>
                        <span className="text-xs text-gray-400">{student.total_enrollments} cursos</span>
                      </label>
                    ))}
                    {students.length === 0 && <p className="text-center text-gray-500 py-6 text-sm">No hay estudiantes</p>}
                  </div>
                </div>
                <Button className="w-full h-12 bg-orange-600 hover:bg-orange-700" onClick={handleAssign} disabled={saving || !selectedCourseId || selectedStudentIds.length === 0}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                  Inscribir {selectedStudentIds.length} estudiante{selectedStudentIds.length !== 1 ? "s" : ""}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* USUARIOS */}
          <TabsContent value="users" className="space-y-4">
            <h3 className="font-semibold text-gray-900">Estudiantes ({students.length})</h3>
            {students.map(student => (
              <Card key={student.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {student.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm">{student.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{student.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${student.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {student.status === "active" ? "Activo" : "Inactivo"}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{student.total_enrollments} cursos · {student.total_certificates} certs</p>
                  </div>
                </div>
              </Card>
            ))}
            {students.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No hay estudiantes registrados</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
