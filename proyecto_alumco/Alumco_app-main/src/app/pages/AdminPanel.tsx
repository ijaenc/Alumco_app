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
import { courseService, type Course, type Module } from "../services/courseService";
import { evaluationService, type EvaluationFull } from "../services/evaluationService";
import { adminService, type StudentSummary } from "../services/adminService";
import type { UploadResult } from "../services/storageService";
import { toast } from "sonner";

interface QuestionDraft { id: string; text: string; options: { text: string; is_correct: boolean }[]; }
interface ModuleDraft { title: string; type: "video" | "document" | "image"; duration: string; content_url: string; useUpload: boolean; }

// ── Modal de edición ──────────────────────────────────────────────────────────
function EditCourseModal({ course, onClose, onSaved }: { course: Course; onClose: () => void; onSaved: (updated: Course) => void }) {
  const [tab, setTab] = useState("info");
  const [saving, setSaving] = useState(false);

  // Info
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description);
  const [duration, setDuration] = useState(course.duration || "");
  const [status, setStatus] = useState(course.status as "draft" | "published" | "archived");
  const [imageUrl, setImageUrl] = useState(course.image_url || "");
  const [imageUploaded, setImageUploaded] = useState<UploadResult | null>(null);
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");

  // Módulos
  const [modules, setModules] = useState<Module[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [showAddModule, setShowAddModule] = useState(false);
  const [newMod, setNewMod] = useState<ModuleDraft>({ title: "", type: "video", duration: "", content_url: "", useUpload: false });
  const [newModUpload, setNewModUpload] = useState<UploadResult | null>(null);
  const [deletingModule, setDeletingModule] = useState<string | null>(null);
  // Estado para editar módulo inline
  const [editModId, setEditModId] = useState<string | null>(null);
  const [editModTitle, setEditModTitle] = useState("");
  const [editModType, setEditModType] = useState<"video" | "document" | "image">("video");
  const [editModDuration, setEditModDuration] = useState("");
  const [editModUrl, setEditModUrl] = useState("");
  const [editModUpload, setEditModUpload] = useState<UploadResult | null>(null);
  const [editModMode, setEditModMode] = useState<"url" | "upload">("url");
  const [savingMod, setSavingMod] = useState(false);

  // Evaluación
  const [evaluation, setEvaluation] = useState<EvaluationFull | null>(null);
  const [loadingEval, setLoadingEval] = useState(true);
  const [evalTitle, setEvalTitle] = useState("");
  const [evalPassScore, setEvalPassScore] = useState(70);
  const [evalTimeLimit, setEvalTimeLimit] = useState(30);
  const [evalMaxAttempts, setEvalMaxAttempts] = useState(2);
  const [evalWaitDays, setEvalWaitDays] = useState(14);
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [savingEval, setSavingEval] = useState(false);

  useEffect(() => {
    courseService.getById(course.id).then(data => {
      setModules(data.modules || []);
      setLoadingModules(false);
      if (data.evaluation?.id) {
        evaluationService.getById(data.evaluation.id).then(ev => {
          setEvaluation(ev);
          setEvalTitle(ev.title);
          setEvalPassScore(ev.passing_score);
          setEvalTimeLimit(ev.time_limit_min);
          setEvalMaxAttempts(ev.max_attempts);
          setEvalWaitDays(ev.wait_days);
          setQuestions(ev.questions.map(q => ({
            id: q.id, text: q.text,
            options: q.options.map(o => ({ text: o.text, is_correct: o.is_correct || false })),
          })));
        }).catch(() => {}).finally(() => setLoadingEval(false));
      } else { setLoadingEval(false); }
    }).catch(() => { setLoadingModules(false); setLoadingEval(false); });
  }, [course.id]);

  const handleSaveInfo = async () => {
    if (!title.trim() || !description.trim()) { toast.error("Título y descripción requeridos"); return; }
    setSaving(true);
    try {
      const imgUrl = imageMode === "upload" ? imageUploaded?.url : imageUrl;
      const updated = await courseService.update(course.id, { title, description, duration: duration || undefined, image_url: imgUrl || undefined, status });
      toast.success("Información actualizada");
      onSaved({ ...course, ...updated });
    } catch (err: any) { toast.error(err.message || "Error al guardar");
    } finally { setSaving(false); }
  };

  const handleAddModule = async () => {
    if (!newMod.title.trim()) { toast.error("El módulo necesita un título"); return; }
    let url = "";
    if (newMod.type === "image") {
      url = newModUpload?.url || "";
      if (!url) { toast.error("Por favor sube una imagen primero"); return; }
    } else {
      url = newMod.useUpload ? (newModUpload?.url || "") : newMod.content_url;
    }
    try {
      const added = await courseService.addModule(course.id, { title: newMod.title, type: newMod.type, duration: newMod.duration || undefined, content_url: url || undefined, order_index: modules.length });
      setModules(prev => [...prev, added]);
      setNewMod({ title: "", type: "video", duration: "", content_url: "", useUpload: false });
      setNewModUpload(null); setShowAddModule(false);
      toast.success("Módulo agregado");
    } catch (err: any) { toast.error(err.message || "Error al agregar módulo"); }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("¿Eliminar este módulo?")) return;
    setDeletingModule(moduleId);
    try {
      await courseService.deleteModule(course.id, moduleId);
      setModules(prev => prev.filter(m => m.id !== moduleId));
      if (editModId === moduleId) setEditModId(null);
      toast.success("Módulo eliminado");
    } catch (err: any) { toast.error(err.message || "Error");
    } finally { setDeletingModule(null); }
  };

  const openEditMod = (m: Module) => {
    setEditModId(m.id);
    setEditModTitle(m.title);
    setEditModType(m.type as "video" | "document" | "image");
    setEditModDuration(m.duration || "");
    setEditModUrl(m.content_url || "");
    setEditModUpload(null);
    setEditModMode("url");
  };

  const handleSaveMod = async () => {
    if (!editModId || !editModTitle.trim()) { toast.error("El módulo necesita un título"); return; }
    setSavingMod(true);
    try {
      let url = editModUrl;
      if (editModType === "image") {
        url = editModUpload?.url || editModUrl;
        if (!url) { toast.error("Por favor sube una imagen"); setSavingMod(false); return; }
      } else {
        url = editModMode === "upload" ? (editModUpload?.url || editModUrl) : editModUrl;
      }
      await courseService.updateModule(course.id, editModId, { title: editModTitle, type: editModType, duration: editModDuration || undefined, content_url: url || undefined });
      setModules(prev => prev.map(m => m.id === editModId ? { ...m, title: editModTitle, type: editModType as any, duration: editModDuration, content_url: url } : m));
      setEditModId(null);
      toast.success("Módulo actualizado");
    } catch (err: any) { toast.error(err.message || "Error al actualizar");
    } finally { setSavingMod(false); }
  };

  const addQuestion = () => setQuestions(prev => [...prev, { id: Date.now().toString(), text: "", options: [{ text: "", is_correct: false }, { text: "", is_correct: false }, { text: "", is_correct: false }, { text: "", is_correct: false }] }]);
  const updateQuestion = (qi: number, text: string) => { const u = [...questions]; u[qi].text = text; setQuestions(u); };
  const updateOption = (qi: number, oi: number, text: string) => { const u = [...questions]; u[qi].options[oi].text = text; setQuestions(u); };
  const setCorrectOption = (qi: number, oi: number) => { const u = [...questions]; u[qi].options = u[qi].options.map((o, i) => ({ ...o, is_correct: i === oi })); setQuestions(u); };
  const removeQuestion = (qi: number) => setQuestions(questions.filter((_, i) => i !== qi));

  const handleSaveEval = async () => {
    if (!evalTitle.trim()) { toast.error("La evaluación necesita un título"); return; }
    if (!evaluation && questions.length === 0) { toast.error("Agrega al menos una pregunta"); return; }
    if (!evaluation) {
      for (const q of questions) {
        if (!q.text.trim()) { toast.error("Todas las preguntas necesitan texto"); return; }
        if (!q.options.some(o => o.is_correct)) { toast.error(`La pregunta "${q.text}" necesita una respuesta correcta`); return; }
        if (q.options.some(o => !o.text.trim())) { toast.error("Todas las opciones deben tener texto"); return; }
      }
    }
    setSavingEval(true);
    try {
      if (evaluation?.id) {
        await evaluationService.update(evaluation.id, { title: evalTitle, time_limit_min: evalTimeLimit, passing_score: evalPassScore, max_attempts: evalMaxAttempts, wait_days: evalWaitDays });
        toast.success("Evaluación actualizada");
      } else {
        await evaluationService.create({ course_id: course.id, title: evalTitle, time_limit_min: evalTimeLimit, passing_score: evalPassScore, max_attempts: evalMaxAttempts, wait_days: evalWaitDays, questions: questions.map((q, i) => ({ text: q.text, order_index: i, options: q.options.map((o, j) => ({ text: o.text, is_correct: o.is_correct, order_index: j })) })) });
        toast.success("Evaluación creada");
      }
    } catch (err: any) { toast.error(err.message || "Error");
    } finally { setSavingEval(false); }
  };

  const getModCat = (type: string) => type === "video" ? "videos" : type === "image" ? "images" : "documents";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-4xl flex flex-col" style={{ maxHeight: "90vh" }}>
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl flex-shrink-0">
          <h3 className="font-semibold text-gray-900">Editar: {course.title}</h3>
          <Button size="icon" variant="ghost" onClick={onClose}><X className="w-5 h-5" /></Button>
        </div>
        <div className="px-6 pt-4 flex-shrink-0">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {[["info","Información"],["modules","Módulos"],["evaluation","Evaluación"]].map(([t,l]) => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === t ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>{l}</button>
            ))}
          </div>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">

          {/* INFO */}
          {tab === "info" && (<>
            <div className="space-y-2"><Label>Título <span className="text-red-500">*</span></Label><Input value={title} onChange={e => setTitle(e.target.value)} className="bg-gray-50" /></div>
            <div className="space-y-2"><Label>Descripción <span className="text-red-500">*</span></Label><Textarea value={description} onChange={e => setDescription(e.target.value)} className="bg-gray-50 min-h-[100px]" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Duración</Label><Input placeholder="Ej: 2h 30min" value={duration} onChange={e => setDuration(e.target.value)} className="bg-gray-50" /></div>
              <div className="space-y-2"><Label>Estado</Label>
                <select className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm" value={status} onChange={e => setStatus(e.target.value as any)}>
                  <option value="published">Publicado</option><option value="draft">Borrador</option><option value="archived">Archivado</option>
                </select>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Imagen de portada</Label>
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                  <button onClick={() => setImageMode("url")} className={`px-3 py-1 rounded-md text-xs font-medium ${imageMode === "url" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}><Link className="w-3 h-3 inline mr-1" />URL</button>
                  <button onClick={() => setImageMode("upload")} className={`px-3 py-1 rounded-md text-xs font-medium ${imageMode === "upload" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}><Send className="w-3 h-3 inline mr-1" />Subir</button>
                </div>
              </div>
              {imageMode === "url" ? (<><Input placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="bg-gray-50" />{imageUrl && <img src={imageUrl} alt="" className="w-full h-32 object-cover rounded-lg" onError={e => (e.currentTarget.style.display="none")} />}</>) : (<FileUploader category="images" label="" hint="Sube la nueva imagen" maxSizeMB={10} onUpload={r => setImageUploaded(r)} />)}
            </div>
            <Button className="w-full h-11 bg-primary" onClick={handleSaveInfo} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}Guardar información
            </Button>
          </>)}

          {/* MÓDULOS */}
          {tab === "modules" && (<>
            {loadingModules ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div> : (<>
              <div className="space-y-2">
                {modules.map(m => (
                  <div key={m.id}>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{m.title}</p>
                        <p className="text-xs text-gray-500 capitalize">{m.type}{m.duration ? ` · ${m.duration}` : ""}{m.content_url ? " · Contenido ✓" : ""}</p>
                      </div>
                      <Button size="icon" variant="ghost" className={`h-8 w-8 flex-shrink-0 ${editModId === m.id ? "text-yellow-600 bg-yellow-50" : "text-blue-500"}`}
                        onClick={() => editModId === m.id ? setEditModId(null) : openEditMod(m)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 flex-shrink-0"
                        disabled={deletingModule === m.id} onClick={() => handleDeleteModule(m.id)}>
                        {deletingModule === m.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </div>
                    {editModId === m.id && (
                      <div className="mt-1 p-4 bg-yellow-50 rounded-xl border border-yellow-200 space-y-3">
                        <p className="text-xs font-semibold text-yellow-800">✏️ Editando: {m.title}</p>
                        <Input placeholder="Título" value={editModTitle} onChange={e => setEditModTitle(e.target.value)} className="bg-white" />
                        <div className="grid grid-cols-2 gap-3">
                          <select className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm" value={editModType}
                            onChange={e => { setEditModType(e.target.value as any); setEditModUrl(""); setEditModUpload(null); }}>
                            <option value="video">Video</option><option value="document">Documento</option><option value="image">Imagen</option>
                          </select>
                          <Input placeholder="Duración" value={editModDuration} onChange={e => setEditModDuration(e.target.value)} className="bg-white" />
                        </div>
                        {editModType === "image" ? (
                          <FileUploader category="images" label="" hint="Sube nueva imagen" maxSizeMB={10} onUpload={r => setEditModUpload(r)} />
                        ) : (
                          <div className="space-y-2">
                            <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-lg w-fit">
                              <button onClick={() => setEditModMode("url")} className={`px-3 py-1 rounded-md text-xs font-medium ${editModMode === "url" ? "bg-yellow-100 text-yellow-700" : "text-gray-500"}`}><Link className="w-3 h-3 inline mr-1" />URL</button>
                              <button onClick={() => setEditModMode("upload")} className={`px-3 py-1 rounded-md text-xs font-medium ${editModMode === "upload" ? "bg-yellow-100 text-yellow-700" : "text-gray-500"}`}><Send className="w-3 h-3 inline mr-1" />Subir</button>
                            </div>
                            {editModMode === "url" ? (
                              <Input placeholder={editModType === "video" ? "https://youtube.com/..." : "https://... URL"} value={editModUrl} onChange={e => setEditModUrl(e.target.value)} className="bg-white" />
                            ) : (
                              <FileUploader category={getModCat(editModType) as any} label="" hint={editModType === "video" ? "Sube el video" : "Sube el documento"} maxSizeMB={editModType === "video" ? 500 : 50} onUpload={r => setEditModUpload(r)} />
                            )}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveMod} className="bg-yellow-500 hover:bg-yellow-600 text-white" disabled={savingMod}>
                            {savingMod ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}Guardar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditModId(null)}>Cancelar</Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {modules.length === 0 && <p className="text-center text-gray-500 py-4 text-sm">No hay módulos</p>}
              </div>
              <Button variant="outline" className="w-full" onClick={() => setShowAddModule(!showAddModule)}>
                <Plus className="w-4 h-4 mr-2" />Agregar módulo
              </Button>
              {showAddModule && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-3">
                  <Input placeholder="Título del módulo" value={newMod.title} onChange={e => setNewMod({ ...newMod, title: e.target.value })} className="bg-white" />
                  <div className="grid grid-cols-2 gap-3">
                    <select className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm" value={newMod.type}
                      onChange={e => setNewMod({ ...newMod, type: e.target.value as any, useUpload: false, content_url: "" })}>
                      <option value="video">Video</option><option value="document">Documento</option><option value="image">Imagen</option>
                    </select>
                    <Input placeholder="Duración (ej: 25 min)" value={newMod.duration} onChange={e => setNewMod({ ...newMod, duration: e.target.value })} className="bg-white" />
                  </div>
                  {newMod.type === "image" ? (
                    <FileUploader category="images" label="" hint="Sube una imagen" maxSizeMB={10} onUpload={r => setNewModUpload(r)} />
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-lg w-fit">
                        <button onClick={() => setNewMod({ ...newMod, useUpload: false })} className={`px-3 py-1 rounded-md text-xs font-medium ${!newMod.useUpload ? "bg-blue-100 text-blue-700" : "text-gray-500"}`}><Link className="w-3 h-3 inline mr-1" />URL</button>
                        <button onClick={() => setNewMod({ ...newMod, useUpload: true })} className={`px-3 py-1 rounded-md text-xs font-medium ${newMod.useUpload ? "bg-blue-100 text-blue-700" : "text-gray-500"}`}><Send className="w-3 h-3 inline mr-1" />Subir</button>
                      </div>
                      {!newMod.useUpload ? (
                        <Input placeholder={newMod.type === "video" ? "https://youtube.com/..." : "https://..."} value={newMod.content_url} onChange={e => setNewMod({ ...newMod, content_url: e.target.value })} className="bg-white" />
                      ) : (
                        <FileUploader category={getModCat(newMod.type) as any} label="" hint={newMod.type === "video" ? "Sube el video" : "Sube el documento"} maxSizeMB={newMod.type === "video" ? 500 : 50} onUpload={r => setNewModUpload(r)} />
                      )}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddModule} className="bg-primary"><CheckCircle className="w-4 h-4 mr-1" />Agregar</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setShowAddModule(false); setNewModUpload(null); }}>Cancelar</Button>
                  </div>
                </div>
              )}
            </>)}
          </>)}

          {/* EVALUACIÓN */}
          {tab === "evaluation" && (<>
            {loadingEval ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div> : (<>
              {evaluation && <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">Ya existe una evaluación. Puedes editar la configuración. Para cambiar las preguntas debes recrear la evaluación.</div>}
              <Input placeholder="Título de la evaluación" value={evalTitle} onChange={e => setEvalTitle(e.target.value)} className="bg-gray-50" />
              <div className="grid grid-cols-2 gap-3">
                {[{ label: "Nota mínima (%)", value: evalPassScore, set: setEvalPassScore, min: 1, max: 100 }, { label: "Tiempo límite (min)", value: evalTimeLimit, set: setEvalTimeLimit, min: 5, max: 180 }, { label: "Intentos máximos", value: evalMaxAttempts, set: setEvalMaxAttempts, min: 1, max: 5 }, { label: "Días de espera", value: evalWaitDays, set: setEvalWaitDays, min: 0, max: 60 }].map(f => (
                  <div key={f.label} className="space-y-1"><Label className="text-xs">{f.label}</Label><Input type="number" min={f.min} max={f.max} value={f.value} onChange={e => f.set(Number(e.target.value))} className="bg-gray-50" /></div>
                ))}
              </div>
              {!evaluation && (<>
                <div className="flex items-center justify-between"><Label className="text-sm font-semibold">Preguntas ({questions.length})</Label><Button size="sm" variant="outline" onClick={addQuestion} className="h-7 text-xs"><Plus className="w-3 h-3 mr-1" />Pregunta</Button></div>
                <div className="space-y-3">
                  {questions.map((q, qi) => (
                    <div key={q.id} className="p-4 bg-white rounded-xl border border-gray-200">
                      <div className="flex gap-2 mb-3"><Input placeholder={`Pregunta ${qi + 1}`} value={q.text} onChange={e => updateQuestion(qi, e.target.value)} className="flex-1" /><Button size="icon" variant="ghost" onClick={() => removeQuestion(qi)} className="h-10 w-10 text-red-500"><X className="w-4 h-4" /></Button></div>
                      <div className="space-y-2">{q.options.map((opt, oi) => (<div key={oi} className="flex items-center gap-2"><button onClick={() => setCorrectOption(qi, oi)} className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${opt.is_correct ? "border-green-500 bg-green-500" : "border-gray-300"}`}>{opt.is_correct && <div className="w-2 h-2 bg-white rounded-full" />}</button><Input placeholder={`Opción ${oi + 1}`} value={opt.text} onChange={e => updateOption(qi, oi, e.target.value)} className={`flex-1 text-sm ${opt.is_correct ? "border-green-300 bg-green-50" : ""}`} /></div>))}</div>
                      <p className="text-xs text-gray-400 mt-2">● = respuesta correcta</p>
                    </div>
                  ))}
                  {questions.length === 0 && <p className="text-xs text-gray-500 text-center py-3">Agrega al menos una pregunta</p>}
                </div>
              </>)}
              <Button className="w-full h-11 bg-green-600 hover:bg-green-700" onClick={handleSaveEval} disabled={savingEval}>
                {savingEval ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {evaluation ? "Actualizar evaluación" : "Crear evaluación"}
              </Button>
            </>)}
          </>)}
        </div>
        <div className="border-t border-gray-100 px-6 py-3 flex-shrink-0"><Button variant="outline" className="w-full" onClick={onClose}>Cerrar</Button></div>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Formulario crear curso
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseImageUrl, setCourseImageUrl] = useState("");
  const [courseImageUploaded, setCourseImageUploaded] = useState<UploadResult | null>(null);
  const [courseDuration, setCourseDuration] = useState("");
  const [courseStatus, setCourseStatus] = useState<"draft" | "published">("published");
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");

  // Módulos del formulario
  const [modules, setModules] = useState<ModuleDraft[]>([]);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [newModule, setNewModule] = useState<ModuleDraft>({ title: "", type: "video", duration: "", content_url: "", useUpload: false });
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
      .catch((err) => console.error("No se pudieron cargar los datos del panel", err))
      .finally(() => setLoading(false));
  }, []);

  const addModule = () => {
    if (!newModule.title.trim()) { toast.error("El módulo necesita un título"); return; }
    // Para imagen siempre usar la URL del archivo subido
    let url = "";
    if (newModule.type === "image") {
      url = newModuleUpload?.url || "";
      if (!url) { toast.error("Por favor sube una imagen primero"); return; }
    } else {
      url = newModule.useUpload ? (newModuleUpload?.url || "") : newModule.content_url;
    }
    setModules([...modules, { ...newModule, content_url: url }]);
    setNewModule({ title: "", type: "video", duration: "", content_url: "", useUpload: false });
    setNewModuleUpload(null); setShowModuleForm(false);
    toast.success("Módulo agregado");
  };

  const removeModule = (index: number) => setModules(modules.filter((_, i) => i !== index));

  const addQuestion = () => setQuestions([...questions, { id: Date.now().toString(), text: "", options: [{ text: "", is_correct: false }, { text: "", is_correct: false }, { text: "", is_correct: false }, { text: "", is_correct: false }] }]);
  const updateQuestion = (qi: number, text: string) => { const u = [...questions]; u[qi].text = text; setQuestions(u); };
  const updateOption = (qi: number, oi: number, text: string) => { const u = [...questions]; u[qi].options[oi].text = text; setQuestions(u); };
  const setCorrectOption = (qi: number, oi: number) => { const u = [...questions]; u[qi].options = u[qi].options.map((o, i) => ({ ...o, is_correct: i === oi })); setQuestions(u); };
  const removeQuestion = (qi: number) => setQuestions(questions.filter((_, i) => i !== qi));

  const handleCreateCourse = async () => {
    if (!courseTitle.trim() || !courseDescription.trim()) { toast.error("Título y descripción requeridos"); return; }
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
      const newCourse = await courseService.create({ title: courseTitle, description: courseDescription, image_url: imageUrl || undefined, duration: courseDuration || undefined, status: courseStatus });
      for (let i = 0; i < modules.length; i++) {
        await courseService.addModule(newCourse.id, { title: modules[i].title, type: modules[i].type, duration: modules[i].duration || undefined, content_url: modules[i].content_url || undefined, order_index: i });
      }
      if (withEval) {
        await evaluationService.create({ course_id: newCourse.id, title: evalTitle, time_limit_min: evalTimeLimit, passing_score: evalPassScore, max_attempts: evalMaxAttempts, wait_days: evalWaitDays, questions: questions.map((q, i) => ({ text: q.text, order_index: i, options: q.options.map((o, j) => ({ text: o.text, is_correct: o.is_correct, order_index: j })) })) });
      }
      setCourses(prev => [newCourse, ...prev]);
      setCourseTitle(""); setCourseDescription(""); setCourseImageUrl(""); setCourseImageUploaded(null); setCourseDuration(""); setImageMode("url");
      setModules([]); setWithEval(false); setEvalTitle(""); setQuestions([]);
      toast.success(`¡Curso "${newCourse.title}" creado!`);
    } catch (err: any) { toast.error(err.message || "Error al crear el curso");
    } finally { setSaving(false); }
  };

  const handleDeleteCourse = async (courseId: string, title: string) => {
    if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return;
    try {
      await courseService.delete(courseId);
      setCourses(prev => prev.filter(c => c.id !== courseId));
      toast.success("Curso eliminado");
    } catch (err: any) { toast.error(err.message || "Error al eliminar"); }
  };

  const handleAssign = async () => {
    if (!selectedCourseId || selectedStudentIds.length === 0) { toast.error("Selecciona un curso y al menos un estudiante"); return; }
    setSaving(true);
    let ok = 0;
    for (const studentId of selectedStudentIds) { try { await courseService.enrollStudent(selectedCourseId, studentId); ok++; } catch { } }
    setSaving(false);
    if (ok > 0) toast.success(`${ok} estudiante${ok !== 1 ? "s" : ""} inscrito${ok !== 1 ? "s" : ""}`);
    else toast.info("Los estudiantes ya estaban inscritos");
    setSelectedStudentIds([]);
  };

  const toggleStudent = (id: string) => setSelectedStudentIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  const getModuleCategory = (type: string) => type === "video" ? "videos" : type === "image" ? "images" : "documents";

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-10 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")} className="text-gray-600"><ArrowLeft className="w-5 h-5" /></Button>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">Panel de Control</h2>
            <p className="text-sm text-gray-500">Gestión completa de la plataforma</p>
          </div>
        </div>
      </header>

      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSaved={updated => { setCourses(prev => prev.map(c => c.id === updated.id ? updated : c)); }}
        />
      )}

      <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-10 py-6 flex items-center gap-3">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="w-full grid grid-cols-1 md:grid-cols-3 bg-gray-100 mb-6 gap-2">
            <TabsTrigger value="content" className="text-xs">Cursos</TabsTrigger>
            <TabsTrigger value="assign" className="text-xs">Asignar</TabsTrigger>
            <TabsTrigger value="users" className="text-xs">Usuarios</TabsTrigger>
          </TabsList>

          {/* CURSOS */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-12 items-start">
            <Card className="p-6 xl:col-span-7 2xl:col-span-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><BookOpen className="w-5 h-5 text-primary" /></div>
                <div><h3 className="font-semibold text-gray-900">Crear Nuevo Curso</h3><p className="text-xs text-gray-500">Completa la información del curso</p></div>
              </div>
              <div className="space-y-5">
                <div className="space-y-2"><Label>Título <span className="text-red-500">*</span></Label><Input placeholder="Ej: Introducción a los Derechos Humanos" value={courseTitle} onChange={e => setCourseTitle(e.target.value)} className="bg-gray-50" /></div>
                <div className="space-y-2"><Label>Descripción <span className="text-red-500">*</span></Label><Textarea placeholder="Describe el contenido..." value={courseDescription} onChange={e => setCourseDescription(e.target.value)} className="bg-gray-50 min-h-[100px]" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label><Clock className="w-3 h-3 inline mr-1" />Duración</Label><Input placeholder="Ej: 2h 30min" value={courseDuration} onChange={e => setCourseDuration(e.target.value)} className="bg-gray-50" /></div>
                  <div className="space-y-2"><Label>Estado</Label><select className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm" value={courseStatus} onChange={e => setCourseStatus(e.target.value as any)}><option value="published">Publicado</option><option value="draft">Borrador</option></select></div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Imagen de portada</Label>
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                      <button onClick={() => setImageMode("url")} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${imageMode === "url" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}><Link className="w-3 h-3 inline mr-1" />URL</button>
                      <button onClick={() => setImageMode("upload")} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${imageMode === "upload" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}><Send className="w-3 h-3 inline mr-1" />Subir</button>
                    </div>
                  </div>
                  {imageMode === "url" ? (<><Input placeholder="https://..." value={courseImageUrl} onChange={e => setCourseImageUrl(e.target.value)} className="bg-gray-50" />{courseImageUrl && <img src={courseImageUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg" onError={e => (e.currentTarget.style.display = "none")} />}</>) : (<FileUploader category="images" label="" hint="Sube la imagen de portada" maxSizeMB={10} onUpload={r => setCourseImageUploaded(r)} />)}
                </div>

                {/* Módulos */}
                <div className="border-t border-gray-100 pt-5">
                  <div className="flex items-center justify-between mb-3"><Label className="text-sm font-semibold">Módulos ({modules.length})</Label><Button size="sm" variant="outline" onClick={() => setShowModuleForm(!showModuleForm)}><Plus className="w-4 h-4 mr-1" />Agregar módulo</Button></div>
                  {modules.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {modules.map((m, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{m.title}</p><p className="text-xs text-gray-500 capitalize">{m.type}{m.duration ? ` · ${m.duration}` : ""}{m.content_url ? " · Contenido ✓" : ""}</p></div>
                          <Button size="icon" variant="ghost" onClick={() => removeModule(i)} className="h-7 w-7 text-red-500 flex-shrink-0"><X className="w-4 h-4" /></Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {showModuleForm && (
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-3">
                      <Input placeholder="Título del módulo" value={newModule.title} onChange={e => setNewModule({ ...newModule, title: e.target.value })} className="bg-white" />
                      <div className="grid grid-cols-2 gap-3">
                        <select className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm" value={newModule.type} onChange={e => setNewModule({ ...newModule, type: e.target.value as any, useUpload: false, content_url: "" })}><option value="video">Video</option><option value="document">Documento</option><option value="image">Imagen</option></select>
                        <Input placeholder="Duración (ej: 25 min)" value={newModule.duration} onChange={e => setNewModule({ ...newModule, duration: e.target.value })} className="bg-white" />
                      </div>
                      {newModule.type === "image" ? (
                        <FileUploader category="images" label="" hint="Sube una imagen (JPG, PNG, WebP)" maxSizeMB={10} onUpload={r => setNewModuleUpload(r)} />
                      ) : (
                        <div className="space-y-2">
                          <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-lg w-fit">
                            <button onClick={() => setNewModule({ ...newModule, useUpload: false })} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${!newModule.useUpload ? "bg-blue-100 text-blue-700" : "text-gray-500"}`}><Link className="w-3 h-3 inline mr-1" />URL</button>
                            <button onClick={() => setNewModule({ ...newModule, useUpload: true })} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${newModule.useUpload ? "bg-blue-100 text-blue-700" : "text-gray-500"}`}><Send className="w-3 h-3 inline mr-1" />Subir</button>
                          </div>
                          {!newModule.useUpload ? (<Input placeholder={newModule.type === "video" ? "https://youtube.com/..." : "https://... URL del documento"} value={newModule.content_url} onChange={e => setNewModule({ ...newModule, content_url: e.target.value })} className="bg-white" />) : (<FileUploader category={getModuleCategory(newModule.type) as any} label="" hint={newModule.type === "video" ? "Sube el video (MP4, WebM)" : "Sube el documento (PDF, Word)"} maxSizeMB={newModule.type === "video" ? 500 : 50} onUpload={r => setNewModuleUpload(r)} />)}
                        </div>
                      )}
                      <div className="flex gap-2"><Button size="sm" onClick={addModule} className="bg-primary"><CheckCircle className="w-4 h-4 mr-1" />Agregar</Button><Button size="sm" variant="ghost" onClick={() => { setShowModuleForm(false); setNewModuleUpload(null); }}>Cancelar</Button></div>
                    </div>
                  )}
                </div>

                {/* Evaluación */}
                <div className="border-t border-gray-100 pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-semibold">Evaluación Final</Label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs text-gray-600">Incluir evaluación</span>
                      <div onClick={() => setWithEval(!withEval)} className={`w-10 h-6 rounded-full transition-colors cursor-pointer ${withEval ? "bg-primary" : "bg-gray-300"}`}><div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${withEval ? "translate-x-5" : "translate-x-1"}`} /></div>
                    </label>
                  </div>
                  {withEval && (
                    <div className="space-y-4 p-4 bg-green-50 rounded-xl border border-green-200">
                      <Input placeholder="Título de la evaluación" value={evalTitle} onChange={e => setEvalTitle(e.target.value)} className="bg-white" />
                      <div className="grid grid-cols-2 gap-3">
                        {[{ label: "Nota mínima (%)", value: evalPassScore, set: setEvalPassScore, min: 1, max: 100 }, { label: "Tiempo límite (min)", value: evalTimeLimit, set: setEvalTimeLimit, min: 5, max: 180 }, { label: "Intentos máximos", value: evalMaxAttempts, set: setEvalMaxAttempts, min: 1, max: 5 }, { label: "Días de espera", value: evalWaitDays, set: setEvalWaitDays, min: 0, max: 60 }].map(f => (<div key={f.label} className="space-y-1"><Label className="text-xs">{f.label}</Label><Input type="number" min={f.min} max={f.max} value={f.value} onChange={e => f.set(Number(e.target.value))} className="bg-white" /></div>))}
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-3"><Label className="text-xs font-semibold">Preguntas ({questions.length})</Label><Button size="sm" variant="outline" onClick={addQuestion} className="h-7 text-xs"><Plus className="w-3 h-3 mr-1" />Pregunta</Button></div>
                        <div className="space-y-4">
                          {questions.map((q, qi) => (
                            <div key={q.id} className="p-4 bg-white rounded-xl border border-gray-200">
                              <div className="flex gap-2 mb-3"><Input placeholder={`Pregunta ${qi + 1}`} value={q.text} onChange={e => updateQuestion(qi, e.target.value)} className="flex-1" /><Button size="icon" variant="ghost" onClick={() => removeQuestion(qi)} className="h-10 w-10 text-red-500 flex-shrink-0"><X className="w-4 h-4" /></Button></div>
                              <div className="space-y-2">{q.options.map((opt, oi) => (<div key={oi} className="flex items-center gap-2"><button onClick={() => setCorrectOption(qi, oi)} className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${opt.is_correct ? "border-green-500 bg-green-500" : "border-gray-300"}`}>{opt.is_correct && <div className="w-2 h-2 bg-white rounded-full" />}</button><Input placeholder={`Opción ${oi + 1}`} value={opt.text} onChange={e => updateOption(qi, oi, e.target.value)} className={`flex-1 text-sm ${opt.is_correct ? "border-green-300 bg-green-50" : ""}`} /></div>))}</div>
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

            {/* Lista cursos */}
            <div className="xl:col-span-5 2xl:col-span-4">
              <h3 className="font-semibold text-gray-900 mb-4">Cursos Existentes ({courses.length})</h3>
              <div className="space-y-3">
                {courses.map(course => (
                  <Card key={course.id} className="p-4">
                    <div className="flex items-center gap-3">
                      {course.image_url ? (<img src={course.image_url} alt={course.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />) : (<div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0"><FileText className="w-6 h-6 text-purple-600" /></div>)}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">{course.title}</h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${course.status === "published" ? "bg-green-100 text-green-700" : course.status === "archived" ? "bg-gray-100 text-gray-500" : "bg-yellow-100 text-yellow-700"}`}>
                            {course.status === "published" ? "Publicado" : course.status === "archived" ? "Archivado" : "Borrador"}
                          </span>
                          {course.duration && <span className="text-xs text-gray-500">{course.duration}</span>}
                          {course.enrolled_students !== undefined && <span className="text-xs text-gray-500">{course.enrolled_students} estudiantes</span>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingCourse(course)}><Edit className="w-4 h-4 text-blue-600" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDeleteCourse(course.id, course.title)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    </div>
                  </Card>
                ))}
                {courses.length === 0 && (<div className="text-center py-8 text-gray-500"><BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No hay cursos creados aún</p></div>)}
              </div>
            </div>
            </div>
          </TabsContent>

          {/* ASIGNAR */}
          <TabsContent value="assign" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"><Send className="w-5 h-5 text-orange-600" /></div><div><h3 className="font-semibold text-gray-900">Asignar Capacitación</h3><p className="text-xs text-gray-500">Inscribe estudiantes en cursos</p></div></div>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Seleccionar Curso</Label><select className="w-full h-12 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm" value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}><option value="">-- Selecciona un curso --</option>{courses.filter(c => c.status === "published").map(c => (<option key={c.id} value={c.id}>{c.title}</option>))}</select></div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><Label>Estudiantes ({selectedStudentIds.length} seleccionados)</Label><Button size="sm" variant="ghost" className="text-xs text-primary" onClick={() => setSelectedStudentIds(selectedStudentIds.length === students.length ? [] : students.map(s => s.id))}>{selectedStudentIds.length === students.length ? "Deseleccionar todos" : "Seleccionar todos"}</Button></div>
                  <div className="border border-gray-200 rounded-lg bg-gray-50 max-h-64 overflow-y-auto">
                    {students.map(student => (<label key={student.id} className={`flex items-center gap-3 p-3 hover:bg-white cursor-pointer border-b border-gray-100 last:border-0 ${selectedStudentIds.includes(student.id) ? "bg-blue-50" : ""}`}><input type="checkbox" className="w-4 h-4 accent-blue-600" checked={selectedStudentIds.includes(student.id)} onChange={() => toggleStudent(student.id)} /><div className="flex-1"><p className="text-sm font-medium text-gray-900">{student.name}</p><p className="text-xs text-gray-500">{student.email}</p></div><span className="text-xs text-gray-400">{student.total_enrollments} cursos</span></label>))}
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
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center"><span className="text-white text-sm font-semibold">{student.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}</span></div>
                  <div className="flex-1 min-w-0"><h4 className="font-medium text-gray-900 text-sm">{student.name}</h4><p className="text-xs text-gray-500 truncate">{student.email}</p></div>
                  <div className="text-right"><span className={`text-xs px-2 py-1 rounded-full ${student.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{student.status === "active" ? "Activo" : "Inactivo"}</span><p className="text-xs text-gray-500 mt-1">{student.total_enrollments} cursos · {student.total_certificates} certs</p></div>
                </div>
              </Card>
            ))}
            {students.length === 0 && (<div className="text-center py-12 text-gray-500"><Users className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No hay estudiantes registrados</p></div>)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

