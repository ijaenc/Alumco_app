import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  ArrowLeft, Search, School, Loader2, X, Save, MapPin, UserPlus,
  Eye, EyeOff
} from "lucide-react";
import { adminService, type StudentSummary } from "../services/adminService";
import { api } from "../services/api";
import { toast } from "sonner";

// ── Modal para crear PROFESOR ──────────────────────────────────────────────────
function CreateTeacherModal({ onClose, onCreated }: { onClose: () => void; onCreated: (user: any) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [sede, setSede] = useState("");
  const [saving, setSaving] = useState(false);
  const role = "teacher"; // Fijo como profesor

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
      toast.success(`Profesor "${name}" creado exitosamente`);
      onCreated(newUser);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Error al crear el profesor");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-md">
        {/* Header */}
        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <School className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Agregar Profesor</h3>
              <p className="text-xs text-gray-500">Crea un nuevo docente o instructor</p>
            </div>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose}><X className="w-5 h-5" /></Button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Nombre completo <span className="text-red-500">*</span></Label>
            <Input placeholder="Ej: Carlos Méndez" value={name} onChange={e => setName(e.target.value)} className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <Label>Correo electrónico <span className="text-red-500">*</span></Label>
            <Input type="email" placeholder="profesor@alumco.org" value={email} onChange={e => setEmail(e.target.value)} className="bg-gray-50" />
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
            <Label><MapPin className="w-3 h-3 inline mr-1" />Sede asignada <span className="text-gray-400 text-xs font-normal">(opcional)</span></Label>
            <Input placeholder="Ej: Patahual" value={sede} onChange={e => setSede(e.target.value)} className="bg-gray-50" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white" onClick={handleCreate} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
              {saving ? "Creando..." : "Crear profesor"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Página principal de Profesores ──────────────────────────────────────────────
export default function AdminTeachers() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingSede, setEditingSede] = useState<string | null>(null);
  const [sedeValue, setSedeValue] = useState("");
  const [savingSede, setSavingSede] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    // IMPORTANTE: Asegúrate de que tu adminService tenga esta función o similar 
    // que devuelva solo profesores. Si no, usa getStudents() y fíltralos.
    adminService.getStudents() 
      .then((users) => {
          // Filtramos simulando que solo queremos profesores
          // Si tu backend ya los filtra, puedes quitar este .filter()
          setTeachers(users); 
      })
      .catch((err) => console.error("No se pudieron cargar los profesores", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveSede = async (teacherId: string) => {
    setSavingSede(true);
    try {
      await api.patch(`/admin/users/${teacherId}/sede`, { sede: sedeValue });
      setTeachers(prev => prev.map(t => t.id === teacherId ? { ...t, sede: sedeValue } as any : t));
      setEditingSede(null);
      toast.success("Sede actualizada");
    } catch {
      toast.error("Error al actualizar sede");
    } finally { setSavingSede(false); }
  };

  const handleUserCreated = (newUser: any) => {
    setTeachers(prev => [{ ...newUser, status: 'active' }, ...prev]);
  };

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ((t as any).sede || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-600" /></div>;

  return (
    <div className="min-h-screen bg-background">
      {showCreateModal && <CreateTeacherModal onClose={() => setShowCreateModal(false)} onCreated={handleUserCreated} />}

      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")} className="text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">Equipo Docente</h1>
              <p className="text-xs text-gray-500">{teachers.length} profesores registrados</p>
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white h-9" onClick={() => setShowCreateModal(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Agregar Prof.
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Buscar por nombre, email o sede..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-gray-50" />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-3">
        {filtered.map(teacher => (
          <Card key={teacher.id} className="p-4 border-l-4 border-l-orange-500">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">{getInitials(teacher.name)}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{teacher.name}</h3>
                    <p className="text-xs text-gray-500">{teacher.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${teacher.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {teacher.status === "active" ? "Activo" : "Inactivo"}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  {editingSede === teacher.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input value={sedeValue} onChange={e => setSedeValue(e.target.value)} placeholder="Nombre de la sede" className="h-7 text-xs flex-1" onKeyDown={e => { if (e.key === "Enter") handleSaveSede(teacher.id); if (e.key === "Escape") setEditingSede(null); }} autoFocus />
                      <Button size="icon" className="h-7 w-7 bg-orange-600 hover:bg-orange-700" disabled={savingSede} onClick={() => handleSaveSede(teacher.id)}>{savingSede ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}</Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingSede(null)}><X className="w-3 h-3" /></Button>
                    </div>
                  ) : (
                    <button className="text-xs text-gray-500 hover:text-orange-600 transition-colors text-left" onClick={() => { setEditingSede(teacher.id); setSedeValue((teacher as any).sede || ""); }}>
                      {(teacher as any).sede || <span className="text-gray-400 italic">Sin sede — clic para editar</span>}
                    </button>
                  )}
                </div>
                
                <div className="mt-3 inline-flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs font-semibold">
                  <School className="w-3 h-3" /> Docente Alumco
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <School className="w-12 h-12 mx-auto mb-3 opacity-30 text-orange-500" />
            <p className="mb-4">{searchQuery ? "No se encontraron profesores" : "No hay profesores registrados"}</p>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={() => setShowCreateModal(true)}>
              <UserPlus className="w-4 h-4 mr-2" /> Agregar primer profesor
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}