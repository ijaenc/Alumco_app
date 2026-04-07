import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  ArrowLeft,
  Upload,
  Plus,
  FileText,
  Users,
  Settings,
  Trash2,
  Edit,
  Send,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");

  const handleUploadContent = () => {
    toast.success("Contenido subido exitosamente");
    setCourseTitle("");
    setCourseDescription("");
  };

  const courses = [
    {
      id: 1,
      title: "Derechos Humanos Fundamentales",
      students: 145,
      completion: 78,
    },
    { id: 2, title: "Gestión de Proyectos Sociales", students: 98, completion: 65 },
    { id: 3, title: "Comunicación Efectiva", students: 132, completion: 82 },
  ];

  const users = [
    {
      id: 1,
      name: "María González",
      email: "maria@example.com",
      courses: 3,
      status: "active",
    },
    {
      id: 2,
      name: "Juan Pérez",
      email: "juan@example.com",
      courses: 2,
      status: "active",
    },
    {
      id: 3,
      name: "Ana Martínez",
      email: "ana@example.com",
      courses: 1,
      status: "pending",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin")}
            className="text-gray-600"
          >
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
          <TabsList className="w-full grid grid-cols-4 bg-gray-100 mb-6">
            <TabsTrigger value="content" className="text-xs">
              Contenido
            </TabsTrigger>
            <TabsTrigger value="evaluations" className="text-xs">
              Evaluaciones
            </TabsTrigger>
            <TabsTrigger value="assign" className="text-xs">
              Asignar
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs">
              Usuarios
            </TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Subir Nuevo Curso
                  </h3>
                  <p className="text-xs text-gray-500">
                    Crea contenido de capacitación
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título del Curso</Label>
                  <Input
                    id="title"
                    placeholder="Ej: Introducción a DDHH"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe el contenido del curso..."
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    className="bg-gray-50 min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Archivo de Video/Documento</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      Click para subir archivo
                    </p>
                    <p className="text-xs text-gray-500">
                      MP4, PDF, PPTX (max. 100MB)
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full h-12 bg-primary hover:bg-blue-600"
                  onClick={handleUploadContent}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Subir Contenido
                </Button>
              </div>
            </Card>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">
                Cursos Existentes
              </h3>
              <div className="space-y-3">
                {courses.map((course) => (
                  <Card key={course.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">
                          {course.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {course.students} estudiantes • {course.completion}%
                          completado
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost">
                          <Edit className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button size="icon" variant="ghost">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Evaluations Tab */}
          <TabsContent value="evaluations" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Crear Evaluación
                  </h3>
                  <p className="text-xs text-gray-500">
                    Añade preguntas y respuestas
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Pregunta</Label>
                  <Input
                    placeholder="Escribe tu pregunta..."
                    className="bg-gray-50"
                  />
                </div>

                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Label className="text-xs text-gray-600">
                      Opción {i}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder={`Respuesta ${i}`}
                        className="bg-gray-50"
                      />
                      <Button
                        size="icon"
                        variant={i === 1 ? "default" : "outline"}
                        className={
                          i === 1 ? "bg-green-600 hover:bg-green-700" : ""
                        }
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-12"
                    onClick={() => toast.success("Pregunta añadida")}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Añadir Pregunta
                  </Button>
                  <Button
                    className="flex-1 h-12 bg-green-600 hover:bg-green-700"
                    onClick={() => toast.success("Evaluación creada")}
                  >
                    Guardar Evaluación
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Assign Tab */}
          <TabsContent value="assign" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Send className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Asignar Capacitación
                  </h3>
                  <p className="text-xs text-gray-500">
                    Envía cursos a usuarios
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Seleccionar Curso</Label>
                  <select className="w-full h-12 px-3 rounded-lg border border-gray-200 bg-gray-50">
                    <option>Derechos Humanos Fundamentales</option>
                    <option>Gestión de Proyectos Sociales</option>
                    <option>Comunicación Efectiva</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Seleccionar Usuarios</Label>
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 max-h-48 overflow-y-auto space-y-2">
                    {users.map((user) => (
                      <label
                        key={user.id}
                        className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer"
                      >
                        <input type="checkbox" className="w-4 h-4" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full h-12 bg-orange-600 hover:bg-orange-700"
                  onClick={() => toast.success("Capacitación asignada")}
                >
                  <Send className="w-5 h-5 mr-2" />
                  Asignar a Usuarios
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Gestión de Usuarios</h3>
              <Button size="sm" className="bg-primary">
                <Plus className="w-4 h-4 mr-1" />
                Nuevo
              </Button>
            </div>

            <div className="space-y-3">
              {users.map((user) => (
                <Card key={user.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {user.name}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          user.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {user.status === "active" ? "Activo" : "Pendiente"}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {user.courses} cursos
                      </p>
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
