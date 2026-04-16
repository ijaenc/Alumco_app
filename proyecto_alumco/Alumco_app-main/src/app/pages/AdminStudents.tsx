import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  ArrowLeft, Search, Users, BookOpen, Award,
  TrendingUp, Loader2, X, Save, MapPin, UserPlus,
  Eye, EyeOff, GraduationCap
} from "lucide-react";
import { adminService, type StudentSummary } from "../services/adminService";
import { api } from "../services/api";
import { toast } from "sonner";

// ── Modal para crear ESTUDIANTE ──────────────────────────────────────────────────
function CreateStudentModal({ onClose, onCreated }: { onClose: () => void; onCreated: (user: any) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [sede, setSede] = useState("");
  const [saving, setSaving] = useState(false);
  const role = "student"; // Fijo como estudiante

  const handleCreate = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Nombre, email y contraseña son obligatorios"); return;
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres"); return;
    }
    setSaving(true);
    try {
      const newUser = await adminService.createUser({
        name, email, password, role, sede: sede || undefined,
      });
      toast.success(`Estudiante "${name}" creado exitosamente`);
      onCreated(newUser);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Error al crear el estudiante");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-md">
        {/* Header */}
        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Agregar Estudiante</h3>
              <p className="text-xs text-gray-500">Crea un nuevo alumno para la plataforma</p>
            </div>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose}><X className="w-5 h-5" /></Button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Nombre completo <span className="text-red-500">*</span></Label>
            <Input placeholder="Ej: María González" value={name} onChange={e => setName(e.target.value)} className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <Label>Correo electrónico <span className="text-red-500">*</span></Label>
            <Input type="email" placeholder="correo@ejemplo.com" value={email} onChange={e => setEmail(e.target.value)} className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <Label>Contraseña <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-gray-50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label><MapPin className="w-3 h-3 inline mr-1" />Sede <span className="text-gray-400 text-xs font-normal">(opcional)</span></Label>
            <Input placeholder="Ej: Patahual" value={sede} onChange={e => setSede(e.target.value)} className="bg-gray-50" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button className="flex-1 bg-primary hover:bg-blue-600" onClick={handleCreate} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
              {saving ? "Creando..." : "Crear estudiante"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Página principal de Estudiantes ──────────────────────────────────────────────
export default function AdminStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null);
  const [progress, setProgress] = useState<any | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [editingSede, setEditingSede] = useState<string | null>(null);
  const [sedeValue, setSedeValue] = useState("");
  const [savingSede, setSavingSede] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    adminService.getStudents()
      .then(setStudents)
      .catch((err) => console.error("No se pudieron cargar los estudiantes", err))
      .finally(() => setLoading(false));
  }, []);

  const openStudent = async (student: StudentSummary) => {
    if (selectedStudent?.id === student.id) { setSelectedStudent(null); return; }
    setSelectedStudent(student);
    setLoadingProgress(true);
    try {
      const data = await adminService.getStudentProgress(student.id);
      setProgress(data);
    } catch (err) {
      console.error("No se pudo cargar el progreso del estudiante", err);
      setProgress(null);
    } finally { setLoadingProgress(false); }
  };

  const handleSaveSede = async (studentId: string) => {
    setSavingSede(true);
    try {
      await api.patch(`/admin/users/${studentId}/sede`, { sede: sedeValue });
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, sede: sedeValue } as any : s));
      if (selectedStudent?.id === studentId) setSelectedStudent(prev => prev ? { ...prev, sede: sedeValue } as any : null);
      setEditingSede(null);
      toast.success("Sede actualizada");
    } catch {
      toast.error("Error al actualizar sede");
    } finally { setSavingSede(false); }
  };

  const handleUserCreated = (newUser: any) => {
    setStudents(prev => [{ ...newUser, total_enrollments: 0, total_certificates: 0, total_attempts: 0, average_score: 0, last_activity: newUser.created_at }, ...prev]);
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ((s as any).sede || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const getScoreColor = (score: number) => score >= 90 ? "text-green-600" : score >= 70 ? "text-blue-600" : "text-red-600";

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background">
      {showCreateModal && <CreateStudentModal onClose={() => setShowCreateModal(false)} onCreated={handleUserCreated} />}

      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">Usuarios (Estudiantes)</h1>
              <p className="text-xs text-gray-500">{students.length} estudiantes registrados</p>
            </div>
            <Button className="bg-primary hover:bg-blue-600 h-9" onClick={() => setShowCreateModal(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Agregar
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Buscar por nombre, email o sede..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-gray-50" />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-3">
        {filtered.map(student => (
          <Card key={student.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">{getInitials(student.name)}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{student.name}</h3>
                    <p className="text-xs text-gray-500">{student.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${student.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {student.status === "active" ? "Activo" : "Inactivo"}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  {editingSede === student.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input value={sedeValue} onChange={e => setSedeValue(e.target.value)} placeholder="Nombre de la sede" className="h-7 text-xs flex-1" onKeyDown={e => { if (e.key === "Enter") handleSaveSede(student.id); if (e.key === "Escape") setEditingSede(null); }} autoFocus />
                      <Button size="icon" className="h-7 w-7 bg-primary" disabled={savingSede} onClick={() => handleSaveSede(student.id)}>{savingSede ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}</Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingSede(null)}><X className="w-3 h-3" /></Button>
                    </div>
                  ) : (
                    <button className="text-xs text-gray-500 hover:text-primary transition-colors text-left" onClick={() => { setEditingSede(student.id); setSedeValue((student as any).sede || ""); }}>
                      {(student as any).sede || <span className="text-gray-400 italic">Sin sede — clic para editar</span>}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1 text-xs text-gray-600"><BookOpen className="w-3 h-3" /><span>{student.total_enrollments} cursos</span></div>
                  <div className="flex items-center gap-1 text-xs text-gray-600"><Award className="w-3 h-3" /><span>{student.total_certificates} certificados</span></div>
                  {student.average_score > 0 && <div className={`flex items-center gap-1 text-xs font-medium ${getScoreColor(student.average_score)}`}><TrendingUp className="w-3 h-3" /><span>{student.average_score}% promedio</span></div>}
                </div>

                <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs text-primary p-0" onClick={() => openStudent(student)}>
                  {selectedStudent?.id === student.id ? "Ocultar detalle ▲" : "Ver progreso ▼"}
                </Button>

                {selectedStudent?.id === student.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {loadingProgress ? (
                      <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
                    ) : progress?.enrollments?.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-gray-700">Cursos inscritos:</p>
                        {progress.enrollments.map((en: any) => {
                          const pct = en.total_modules > 0 ? Math.round((en.completed_modules / en.total_modules) * 100) : 0;
                          return (
                            <div key={en.course_id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-start justify-between mb-1">
                                <p className="text-xs font-medium text-gray-900 flex-1 mr-2">{en.course_title}</p>
                                {en.best_score !== null && <span className={`text-xs font-bold flex-shrink-0 ${getScoreColor(en.best_score)}`}>{en.best_score}%</span>}
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <div className="flex-1 bg-gray-200 rounded-full h-1.5"><div className="bg-primary h-1.5 rounded-full" style={{ width: `${pct}%` }} /></div>
                                <span className="text-xs text-gray-500 flex-shrink-0">{en.completed_modules}/{en.total_modules} módulos</span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>{en.attempt_count} intento{en.attempt_count !== 1 ? "s" : ""}</span>
                                {en.certificate_number && <span className="text-green-600 font-medium">✓ {en.certificate_number}</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : <p className="text-xs text-gray-500 text-center py-2">Sin cursos inscritos</p>}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="mb-4">{searchQuery ? "No se encontraron estudiantes" : "No hay estudiantes registrados"}</p>
            <Button className="bg-primary" onClick={() => setShowCreateModal(true)}>
              <UserPlus className="w-4 h-4 mr-2" /> Agregar primer estudiante
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}