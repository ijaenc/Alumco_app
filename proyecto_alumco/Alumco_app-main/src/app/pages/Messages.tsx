import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ArrowLeft, Search, MessageCircle, Plus, Paperclip, Loader2 } from "lucide-react";
import { messageService, type Conversation } from "../services/messageService";
import { toast } from "sonner";

export default function Messages() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    messageService.getConversations()
      .then(setConversations)
      .catch(() => toast.error("Error cargando mensajes"))
      .finally(() => setLoading(false));
  }, []);

  const filteredConversations = conversations.filter((conv) =>
    conv.peer_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">Mensajes</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigate("/messages/new")} className="text-primary">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto">
        {filteredConversations.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.peer_id}
                onClick={() => navigate(`/chat/${conversation.peer_id}`)}
                className="px-4 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      conversation.peer_role === "teacher" || conversation.peer_role === "admin"
                        ? "bg-gradient-to-br from-blue-500 to-blue-600"
                        : "bg-gradient-to-br from-gray-500 to-gray-600"
                    }`}>
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
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {formatTime(conversation.sent_at)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm truncate flex-1 ${conversation.unread_count > 0 ? "font-medium text-gray-900" : "text-gray-600"}`}>
                        {conversation.content}
                      </p>
                    </div>
                    {(conversation.peer_role === "admin" || conversation.peer_role === "teacher") && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-50 text-primary mt-1">
                        {conversation.peer_role === "admin" ? "Administrador" : "Profesor"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay conversaciones</h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              {searchQuery ? "No se encontraron conversaciones" : "Comienza una nueva conversación"}
            </p>
            {!searchQuery && (
              <Button onClick={() => navigate("/messages/new")} className="bg-primary hover:bg-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Nueva conversación
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
