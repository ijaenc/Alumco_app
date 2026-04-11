import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  ArrowLeft, Search, Download, Award, CheckCircle,
  XCircle, Clock, Loader2,
} from "lucide-react";
import { adminService, type StudentSummary } from "../services/adminService";
import { certificateService, type Certificate } from "../services/certificateService";
import { toast } from "sonner";

export default function AdminCertifications() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("certificates");
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      certificateService.getAll(),
      adminService.getStudents(),
    ]).then(([certs, studs]) => {
      setCertificates(certs);
      setStudents(studs);
    }).catch(() => toast.error("Error cargando datos"))
      .finally(() => setLoading(false));
  }, []);

  const filteredCerts = certificates.filter((c) =>
    c.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.course_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const stats = {
    total: certificates.length,
    active: certificates.filter((c) => c.status === "active").length,
    revoked: certificates.filter((c) => c.status === "revoked").length,
    students: students.length,
  };

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
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")} className="text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">Gestión de Certificaciones</h1>
              <p className="text-xs text-gray-500">Administra el progreso y certificados de los usuarios</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por usuario o capacitación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 pb-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-lg font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Activos</p>
                <p className="text-lg font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Revocados</p>
                <p className="text-lg font-bold text-red-600">{stats.revoked}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Estudiantes</p>
                <p className="text-lg font-bold text-purple-600">{stats.students}</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="certificates">Certificados</TabsTrigger>
            <TabsTrigger value="students">Estudiantes</TabsTrigger>
          </TabsList>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="mt-4">
            {filteredCerts.length > 0 ? (
              <div className="space-y-3">
                {filteredCerts.map((cert) => (
                  <Card key={cert.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">{getInitials(cert.student_name)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <h3 className="font-semibold text-gray-900">{cert.student_name}</h3>
                            <p className="text-sm text-gray-600">{cert.course_title}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${cert.status === "active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                            {cert.status === "active" ? "Activo" : "Revocado"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-500">
                          <span>#{cert.certificate_number}</span>
                          <span className={`font-semibold ${getScoreColor(cert.score)}`}>{cert.score}%</span>
                          <span>{new Date(cert.issued_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</span>
                          <span>{cert.instructor_name}</span>
                        </div>
                        {cert.status === "active" && (
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" className="flex-1 bg-primary hover:bg-blue-600" onClick={() => toast.info("Descarga disponible próximamente")}>
                              <Download className="w-4 h-4 mr-1" />
                              Descargar
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={async () => {
                              try {
                                await certificateService.revoke(cert.id);
                                setCertificates((prev) => prev.map((c) => c.id === cert.id ? { ...c, status: "revoked" as const } : c));
                                toast.success("Certificado revocado");
                              } catch { toast.error("Error al revocar"); }
                            }}>
                              Revocar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <Award className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-gray-600">{searchQuery ? "No se encontraron resultados" : "No hay certificados"}</p>
              </div>
            )}
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="mt-4">
            <div className="space-y-3">
              {students.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((student) => (
                <Card key={student.id} className="p-4 cursor-pointer hover:shadow-md" onClick={() => navigate(`/admin/students/${student.id}`)}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">{getInitials(student.name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{student.name}</h3>
                      <p className="text-xs text-gray-500">{student.email}</p>
                      <div className="flex gap-4 mt-1 text-xs text-gray-500">
                        <span>{student.total_enrollments} cursos</span>
                        <span>{student.total_certificates} certificados</span>
                        {student.average_score > 0 && (
                          <span className={getScoreColor(student.average_score)}>Prom: {student.average_score}%</span>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${student.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {student.status === "active" ? "Activo" : "Inactivo"}
                    </span>
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
