import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ArrowLeft, Send, Circle, Loader2, FileText, Image as ImageIcon, Paperclip, X } from "lucide-react";
import { messageService, type Message } from "../services/messageService";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export default function Chat() {
  const navigate = useNavigate();
  const { id: peerId } = useParams();
  const { user } = useAuth();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [peerName, setPeerName] = useState("...");
  const [peerRole, setPeerRole] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!peerId) return;
    // Load peer info and messages
    Promise.all([
      messageService.getMessages(peerId),
      messageService.getAvailableUsers(),
    ]).then(([msgs, users]) => {
      setMessages(msgs);
      const peer = users.find((u) => u.id === peerId);
      if (peer) { setPeerName(peer.name); setPeerRole(peer.role); }
      else if (msgs.length > 0) {
        const peerMsg = msgs.find((m) => m.sender_id === peerId);
        if (peerMsg) { setPeerName(peerMsg.sender_name); setPeerRole(peerMsg.sender_role); }
      }
    }).catch(() => toast.error("Error cargando mensajes"))
      .finally(() => setLoading(false));
  }, [peerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSend = async () => {
    if ((!newMessage.trim() && !selectedFile) || !peerId) return;
    setSending(true);
    try {
      const textToSend = newMessage.trim() || (selectedFile ? `Archivo adjunto: ${selectedFile.name}` : "");
      const msg = await messageService.send(peerId, textToSend);
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
      setSelectedFile(null); 
    } catch (err: any) {
      toast.error(err.message || "Error al enviar el mensaje");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Hoy";
    if (date.toDateString() === yesterday.toDateString()) return "Ayer";
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  };

  const getInitials = (name: string) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  // Group by date
  const grouped = messages.reduce((acc, msg) => {
    const date = formatDate(msg.sent_at || new Date().toISOString());
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {} as Record<string, Message[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/messages")} className="text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                peerRole === "admin" || peerRole === "teacher"
                  ? "bg-gradient-to-br from-blue-500 to-blue-600"
                  : "bg-gradient-to-br from-gray-500 to-gray-600"
              }`}>
                <span className="text-white font-semibold text-sm">{getInitials(peerName)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900 truncate">{peerName}</h2>
                <div className="flex items-center gap-1">
                  <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                  <span className="text-xs text-gray-500">En línea</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-md mx-auto px-4 py-4 space-y-6">
          {Object.entries(grouped).map(([date, dateMessages]) => (
            <div key={date}>
              <div className="flex items-center justify-center mb-4">
                <div className="bg-white px-3 py-1 rounded-full shadow-sm">
                  <span className="text-xs text-gray-600 font-medium">{date}</span>
                </div>
              </div>
              <div className="space-y-3">
                {dateMessages.map((message) => {
                  const isOwn = message.sender_id === user?.id;
                  return (
                    <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                      <div className={`flex gap-2 max-w-[80%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                        {!isOwn && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-xs">{getInitials(message.sender_name)}</span>
                          </div>
                        )}
                        <div>
                          {/* ESTA ES LA LÍNEA MÁGICA DE LOS COLORES */}
                          <div className={`rounded-2xl px-4 py-2.5 ${isOwn ? "bg-blue-600 text-white rounded-br-md shadow-md shadow-blue-200/50" : "bg-white text-gray-900 shadow-sm rounded-bl-md"}`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {message.attachments.map((att) => (
                                  <div key={att.id} className={`flex items-center gap-2 p-2 rounded-lg ${isOwn ? "bg-blue-700" : "bg-gray-100"}`}>
                                    <FileText className={`w-4 h-4 ${isOwn ? "text-white" : "text-blue-600"}`} />
                                    <span className={`text-xs truncate ${isOwn ? "text-white" : "text-gray-900"}`}>{att.file_name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                            <span className="text-xs text-gray-500">{message.sent_at ? formatTime(message.sent_at) : ""}</span>
                            {isOwn && message.read && <span className="text-xs text-blue-500 font-medium">· Leído</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-sm">No hay mensajes aún. ¡Empieza la conversación!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input con opción de archivos adjuntos */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-md mx-auto px-4 py-3">
          
          {selectedFile && (
            <div className="mb-3 flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100 animate-in fade-in">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{selectedFile.name}</p>
                  <p className="text-[10px] text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-400 hover:text-red-500"
                onClick={() => setSelectedFile(null)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
            />
            
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-blue-600 flex-shrink-0 h-10 w-10 rounded-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="w-5 h-5" />
            </Button>

            <div className="flex-1">
              <Input
                type="text"
                placeholder="Escribe un mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                className="bg-gray-50 border-gray-200 rounded-full px-4"
              />
            </div>
            <Button
              size="icon"
              onClick={handleSend}
              disabled={(!newMessage.trim() && !selectedFile) || sending}
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 h-10 w-10 flex-shrink-0"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}