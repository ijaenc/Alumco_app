import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  ArrowLeft, Upload, Plus, FileText, Users, Trash2, Edit,
  Send, CheckCircle, Loader2,
} from "lucide-react";
import { courseService, type Course } from "../services/courseService";
import { adminService, type StudentSummary } from "../services/adminService";
import { toast } from "sonner";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([courseService.getAll(), adminService.getStudents()])
      .then(([c, s]) => { setCourses(c); setStudents(s); })
      .catch(() => toast.error("Error cargando datos"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateCourse = async () => {
    if (!courseTitle || !courseDescription) { toast.error("Completa todos los campos"); return; }
    setSaving(true);
    try {
      const newCourse = await courseService.create({ title: courseTitle, description: courseDescription, status: "published" });
      setCourses((prev) => [newCourse, ...prev]);
      setCourseTitle(""); setCourseDescription("");
      toast.success("Curso creado exitosamente");
    } catch (err: any) {
      toast.error(err.message || "Error al crear el curso");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (courseId: string, title: string) => {
    if (!confirm(`¿Eliminar "${title}"?`)) return;
    try {
      await courseService.delete(courseId);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      toast.success("Curso eliminado");
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar");
    }
  };

  const handleAssign = async () => {
    if (!selectedCourseId || selectedStudentIds.length === 0) { toast.error("Selecciona un curso y al menos un estudiante"); return; }
    setSaving(true);
    let ok = 0;
    for (const studentId of selectedStudentIds) {
      try {
        await courseService.enrollStudent(selectedCourseId, studentId);
        ok++;
      } catch {
        // skip already enrolled
      }
    }
    setSaving(false);
    if (ok > 0) toast.success(`${ok} estudiante${ok !== 1 ? "s" : ""} inscrito${ok !== 1 ? "s" : ""} correctamente`);
    else toast.info("Los estudiantes ya estaban inscritos");
    setSelectedStudentIds([]);
  };

  const toggleStudent = (id: string) =>
    setSelectedStudentIds((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")} className="text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900">Panel de Control</h2>
            <p className="text-xs text-gray-500">Gestión completa</p>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-gray-100 mb-6">
            <TabsTrigger value="content" className="text-xs">Cursos</TabsTrigger>
            <TabsTrigger value="assign"  className="text-xs">Asignar</TabsTrigger>
            <TabsTrigger value="users"   className="text-xs">Usuarios</TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Crear Nuevo Curso</h3>
                  <p className="text-xs text-gray-500">Añade contenido de capacitación</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título del Curso</Label>
                  <Input id="title" placeholder="Ej: Introducción a DDHH" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea id="description" placeholder="Describe el contenido del curso..." value={courseDescription} onChange={(e) => setCourseDescription(e.target.value)} className="bg-gray-50 min-h-[100px]" />
                </div>
                <Button className="w-full h-12 bg-primary hover:bg-blue-600" onClick={handleCreateCourse} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-5 h-5 mr-2" />}
                  {saving ? "Creando..." : "Crear Curso"}
                </Button>
              </div>
            </Card>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Cursos Existentes ({courses.length})</h3>
              <div className="space-y-3">
                {courses.map((course) => (
                  <Card key={course.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">{course.title}</h4>
                        <p className="text-xs text-gray-500">
                          {course.enrolled_students || 0} estudiantes · {course.status}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => toast.info("Edición próximamente")}>
                          <Edit className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDeleteCourse(course.id, course.title)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Assign Tab */}
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
                  <select className="w-full h-12 px-3 rounded-lg border border-gray-200 bg-gray-50" value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
                    <option value="">-- Selecciona un curso --</option>
                    {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Seleccionar Estudiantes ({selectedStudentIds.length} seleccionados)</Label>
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 max-h-48 overflow-y-auto space-y-2">
                    {students.map((student) => (
                      <label key={student.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer">
                        <input type="checkbox" className="w-4 h-4" checked={selectedStudentIds.includes(student.id)} onChange={() => toggleStudent(student.id)} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.email}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <Button className="w-full h-12 bg-orange-600 hover:bg-orange-700" onClick={handleAssign} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                  Asignar a Usuarios
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Estudiantes ({students.length})</h3>
            </div>
            <div className="space-y-3">
              {students.map((student) => (
                <Card key={student.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm">{student.name}</h4>
                      <p className="text-xs text-gray-500 truncate">{student.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${student.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {student.status === "active" ? "Activo" : "Inactivo"}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{student.total_enrollments} cursos</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
