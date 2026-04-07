import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { ArrowLeft, Send, User } from "lucide-react";
import { createConversation, sendMessage } from "../services/messageService";

const availableAdmins = [
  { id: "admin1", name: "Dr. Juan Pérez", role: "Coordinador de Capacitación" },
  { id: "admin2", name: "Lic. María González", role: "Directora de Programas" },
  { id: "support", name: "Soporte Técnico", role: "Asistencia Técnica" },
  { id: "admin3", name: "Lic. Ana Martínez", role: "Recursos Humanos" },
];

export default function NewMessage() {
  const navigate = useNavigate();
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");

  const handleSend = () => {
    if (!selectedAdmin || !message.trim()) return;

    const admin = availableAdmins.find((a) => a.id === selectedAdmin);
    if (!admin) return;

    // Create or find conversation
    const conversation = createConversation(admin.id, admin.name);

    // Send initial message
    const fullMessage = subject
      ? `Asunto: ${subject}\n\n${message}`
      : message;
    sendMessage(conversation.id, fullMessage);

    // Navigate to the chat
    navigate(`/chat/${conversation.id}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/messages")}
              className="text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">
                Nuevo Mensaje
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4">
        <Card className="p-6 mb-4">
          {/* Select Admin */}
          <div className="mb-6">
            <Label className="text-sm font-medium text-gray-900 mb-2 block">
              Destinatario
            </Label>
            <div className="space-y-2">
              {availableAdmins.map((admin) => (
                <div
                  key={admin.id}
                  onClick={() => setSelectedAdmin(admin.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedAdmin === admin.id
                      ? "border-primary bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {getInitials(admin.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {admin.name}
                    </h3>
                    <p className="text-xs text-gray-600">{admin.role}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedAdmin === admin.id
                        ? "border-primary bg-primary"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedAdmin === admin.id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div className="mb-6">
            <Label
              htmlFor="subject"
              className="text-sm font-medium text-gray-900 mb-2 block"
            >
              Asunto (Opcional)
            </Label>
            <Input
              id="subject"
              type="text"
              placeholder="¿Sobre qué quieres escribir?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-white border-gray-200"
            />
          </div>

          {/* Message */}
          <div className="mb-6">
            <Label
              htmlFor="message"
              className="text-sm font-medium text-gray-900 mb-2 block"
            >
              Mensaje
            </Label>
            <Textarea
              id="message"
              placeholder="Escribe tu mensaje aquí..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[150px] bg-white border-gray-200 resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              {message.length} caracteres
            </p>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3 pb-6">
          <Button
            onClick={handleSend}
            disabled={!selectedAdmin || !message.trim()}
            className="w-full h-12 bg-primary hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500"
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar Mensaje
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/messages")}
            className="w-full h-12 border-gray-300"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
