import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { ArrowLeft, Search, Send, Loader2 } from "lucide-react";
import { messageService, type AvailableUser } from "../services/messageService";
import { toast } from "sonner";

export default function NewMessage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<AvailableUser[]>([]);
  const [selected, setSelected] = useState<AvailableUser | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    messageService.getAvailableUsers()
      .then(setUsers)
      .catch(() => toast.error("Error cargando usuarios"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const handleSend = async () => {
    if (!selected || !content.trim()) { toast.error("Selecciona un destinatario y escribe un mensaje"); return; }
    setSending(true);
    try {
      await messageService.send(selected.id, content.trim());
      toast.success(`Mensaje enviado a ${selected.name}`);
      navigate(`/chat/${selected.id}`);
    } catch (err: any) {
      toast.error(err.message || "Error al enviar");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/messages")} className="text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">Nuevo Mensaje</h1>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>

        {/* Selected user */}
        {selected && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{getInitials(selected.name)}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selected.name}</p>
                  <p className="text-xs text-gray-500">{selected.role}</p>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSelected(null)} className="text-gray-500">✕</Button>
            </div>
          </Card>
        )}

        {/* User list */}
        {!selected && (
          loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-2">
              {filtered.map((u) => (
                <Card key={u.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelected(u)}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{getInitials(u.name)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                    <span className="ml-auto text-xs px-2 py-1 bg-blue-50 text-primary rounded-full">{u.role}</span>
                  </div>
                </Card>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-gray-500 py-8">No se encontraron usuarios</p>
              )}
            </div>
          )
        )}

        {/* Message input */}
        {selected && (
          <div className="space-y-3">
            <Input
              placeholder="Escribe tu mensaje..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-gray-50"
            />
            <Button className="w-full h-12 bg-primary hover:bg-blue-600" onClick={handleSend} disabled={sending || !content.trim()}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Enviar Mensaje
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
