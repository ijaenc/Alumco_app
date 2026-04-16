import { useState, useEffect, useRef } from "react"; // Agregamos useRef
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  ArrowLeft, Search, MessageCircle, Users, Send, Loader2, 
  Paperclip, FileText, X // Agregamos iconos para archivos
} from "lucide-react";
import { messageService, type Conversation } from "../services/messageService";
import { adminService, type StudentSummary } from "../services/adminService";
import { toast } from "sonner";

export default function AdminMessages() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null); // Referencia para el input de archivo
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("conversations");
  const [massMessageContent, setMassMessageContent] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allUsers, setAllUsers] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Estado para el archivo

  useEffect(() => {
    Promise.all([
      messageService.getConversations(),
      adminService.getStudents(),
    ]).then(([convs, users]) => {
      setConversations(convs);
      setAllUsers(users);
    }).catch((err) => console.error("No se pudieron cargar los datos de mensajería", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredConversations = conversations.filter((conv) =>
    conv.peer_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = allUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserToggle = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    }
  };

  // Manejador de archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSendMassMessage = async () => {
    if (!massMessageContent.trim() || selectedUsers.length === 0) {
      toast.error("Completa todos los campos", { description: "Selecciona usuarios y escribe un mensaje" });
      return;
    }
    setSending(true);
    let ok = 0;
    for (const userId of selectedUsers) {
      try {
        await messageService.send(userId, massMessageContent.trim());
        ok++;
      } catch { /* skip */ }
    }
    setSending(false);
    if (ok > 0) {
      toast.success(`Mensaje enviado a ${ok} usuario${ok !== 1 ? "s" : ""}`, { description: "El mensaje ha sido entregado exitosamente" });
      setMassMessageContent("");
      setSelectedUsers([]);
      setSelectedFile(null); // Limpiamos el archivo al enviar
    } else {
      toast.error("Error al enviar los mensajes");
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (hours < 1) return `${Math.floor(diff / (1000 * 60))}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  const getInitials = (name: string) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

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
              <h1 className="text-xl font-semibold text-gray-900">Mensajería - Administrador</h1>
              <p className="text-xs text-gray-500">Gestiona conversaciones y envía mensajes masivos</p>
            </div>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="conversations">
                <MessageCircle className="w-4 h-4 mr-2" />
                Conversaciones
              </TabsTrigger>
              <TabsTrigger value="mass">
                <Users className="w-4 h-4 mr-2" />
                Mensaje Masivo
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 pb-6">
        {activeTab === "conversations" && (
          <div>
            {filteredConversations.length > 0 ? (
              <div className="space-y-2">
                {filteredConversations.map((conversation) => (
                  <Card
                    key={conversation.peer_id}
                    onClick={() => navigate(`/chat/${conversation.peer_id}`)}
                    className="p-4 hover:shadow-md cursor-pointer transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-500 to-gray-600">
                          <span className="text-white font-semibold text-sm">
                            {getInitials(conversation.peer_name)}
                          </span>
                        </div>
                        {conversation.unread_count > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">{conversation.unread_count}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{conversation.peer_name}</h3>
                          {conversation.sent_at && (
                            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{formatTime(conversation.sent_at)}</span>
                          )}
                        </div>
                        <p className={`text-sm truncate ${conversation.unread_count > 0 ? "font-medium text-gray-900" : "text-gray-600"}`}>
                          {conversation.content}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay conversaciones</h3>
                <p className="text-sm text-gray-600 text-center">
                  {searchQuery ? "No se encontraron conversaciones" : "Las conversaciones con usuarios aparecerán aquí"}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "mass" && (
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-semibold text-gray-900">Seleccionar Destinatarios</Label>
                <Button variant="ghost" size="sm" onClick={handleSelectAll} className="text-primary">
                  {selectedUsers.length === filteredUsers.length ? "Deseleccionar todos" : "Seleccionar todos"}
                </Button>
              </div>

              {filteredUsers.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserToggle(user.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedUsers.includes(user.id)
                          ? "border-primary bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">{getInitials(user.name)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{user.name}</h3>
                        <p className="text-xs text-gray-600 truncate">{user.email}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedUsers.includes(user.id) ? "border-primary bg-primary" : "border-gray-300"
                      }`}>
                        {selectedUsers.includes(user.id) && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">No se encontraron usuarios</p>
              )}

              {selectedUsers.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-primary">{selectedUsers.length} usuario(s) seleccionado(s)</p>
                </div>
              )}
            </Card>

            <Card className="p-4">
              <Label htmlFor="mass-message" className="text-sm font-semibold text-gray-900 mb-3 block">Mensaje</Label>
              <Textarea
                id="mass-message"
                placeholder="Escribe tu mensaje aquí..."
                value={massMessageContent}
                onChange={(e) => setMassMessageContent(e.target.value)}
                className="min-h-[200px] bg-white border-gray-200 resize-none mb-2"
              />
              
              {/* --- SECCIÓN DE ARCHIVO ADJUNTO --- */}
              <div className="mt-2 mb-4">
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                />
                
                {selectedFile ? (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{selectedFile.name}</p>
                        <p className="text-[10px] text-gray-500 uppercase">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-gray-400 hover:text-red-500"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 gap-2"
                  >
                    <Paperclip className="w-4 h-4" />
                    Adjuntar archivo pesado (PDF, ZIP, Video)
                  </Button>
                )}
              </div>
              {/* --------------------------------- */}

              <p className="text-xs text-gray-500 mb-4">{massMessageContent.length} caracteres</p>
              <Button
                onClick={handleSendMassMessage}
                disabled={!massMessageContent.trim() || selectedUsers.length === 0 || sending}
                className="w-full h-12 bg-primary hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500"
              >
                {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Enviar a {selectedUsers.length} usuario{selectedUsers.length !== 1 ? "s" : ""}
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}