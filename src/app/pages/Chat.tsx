import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  ArrowLeft,
  Send,
  MoreVertical,
  Circle,
  Paperclip,
  Download,
  FileText,
  Image as ImageIcon,
  X,
} from "lucide-react";
import {
  getMessages,
  getConversations,
  sendMessage,
  markAsRead,
  type Message,
  type FileAttachment,
} from "../services/messageService";
import { toast } from "sonner";

export default function Chat() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const conversations = getConversations();
  const conversation = conversations.find((c) => c.id === id);

  useEffect(() => {
    if (id) {
      const loadedMessages = getMessages(id);
      setMessages(loadedMessages);
      markAsRead(id);
    }
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if ((!newMessage.trim() && attachments.length === 0) || !id) return;

    const message = sendMessage(
      id,
      newMessage.trim(),
      "user1",
      "Tú",
      attachments.length > 0 ? attachments : undefined
    );
    setMessages([...messages, message]);
    setNewMessage("");
    setAttachments([]);

    // Simulate admin response after 2 seconds
    if (conversation?.participantRole === "admin") {
      setTimeout(() => {
        const adminResponse: Message = {
          id: `m${Date.now()}`,
          senderId: conversation.participantId,
          senderName: conversation.participantName,
          senderRole: "admin",
          receiverId: "user1",
          receiverName: "Tú",
          content: "Gracias por tu mensaje. Te responderé pronto.",
          timestamp: new Date(),
          read: true,
        };
        setMessages((prev) => [...prev, adminResponse]);
      }, 2000);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: FileAttachment[] = Array.from(files).map((file) => {
      let type = "document";
      if (file.type.startsWith("image/")) type = "image";
      else if (file.type === "application/pdf") type = "pdf";

      return {
        id: `att${Date.now()}-${Math.random()}`,
        name: file.name,
        type,
        size: file.size,
        url: URL.createObjectURL(file),
        uploadedAt: new Date(),
      };
    });

    setAttachments([...attachments, ...newAttachments]);
    toast.success(`${newAttachments.length} archivo(s) adjunto(s)`);
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments(attachments.filter((a) => a.id !== attachmentId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-5 h-5" />;
      case "pdf":
        return <FileText className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Hoy";
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Ayer";
    }

    return messageDate.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  if (!conversation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-gray-600">Conversación no encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/messages")}
              className="text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            {/* Participant Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  conversation.participantRole === "admin"
                    ? "bg-gradient-to-br from-blue-500 to-blue-600"
                    : "bg-gradient-to-br from-gray-500 to-gray-600"
                }`}
              >
                <span className="text-white font-semibold text-sm">
                  {getInitials(conversation.participantName)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900 truncate">
                  {conversation.participantName}
                </h2>
                <div className="flex items-center gap-1">
                  <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                  <span className="text-xs text-gray-500">En línea</span>
                </div>
              </div>
            </div>

            <Button variant="ghost" size="icon" className="text-gray-600">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-md mx-auto px-4 py-4 space-y-6">
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date Separator */}
              <div className="flex items-center justify-center mb-4">
                <div className="bg-white px-3 py-1 rounded-full shadow-sm">
                  <span className="text-xs text-gray-600 font-medium">
                    {date}
                  </span>
                </div>
              </div>

              {/* Messages for this date */}
              <div className="space-y-3">
                {dateMessages.map((message) => {
                  const isOwn = message.senderRole === "user";
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex gap-2 max-w-[80%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                        {/* Avatar for received messages */}
                        {!isOwn && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-xs">
                              {getInitials(message.senderName)}
                            </span>
                          </div>
                        )}

                        {/* Message Bubble */}
                        <div>
                          <div
                            className={`rounded-2xl px-4 py-2.5 ${
                              isOwn
                                ? "bg-primary text-white rounded-br-md"
                                : "bg-white text-gray-900 shadow-sm rounded-bl-md"
                            }`}
                          >
                            {message.content && (
                              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                {message.content}
                              </p>
                            )}
                            
                            {/* Attachments */}
                            {message.attachments && message.attachments.length > 0 && (
                              <div className={`space-y-2 ${message.content ? 'mt-2' : ''}`}>
                                {message.attachments.map((attachment) => (
                                  <div
                                    key={attachment.id}
                                    className={`flex items-center gap-2 p-2 rounded-lg ${
                                      isOwn ? 'bg-blue-600' : 'bg-gray-100'
                                    }`}
                                  >
                                    <div className={`flex-shrink-0 ${isOwn ? 'text-white' : 'text-primary'}`}>
                                      {getFileIcon(attachment.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-xs font-medium truncate ${isOwn ? 'text-white' : 'text-gray-900'}`}>
                                        {attachment.name}
                                      </p>
                                      <p className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                                        {formatFileSize(attachment.size)}
                                      </p>
                                    </div>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className={`h-8 w-8 flex-shrink-0 ${
                                        isOwn ? 'text-white hover:bg-blue-700' : 'text-gray-600 hover:bg-gray-200'
                                      }`}
                                      onClick={() => {
                                        toast.success('Descargando archivo...');
                                      }}
                                    >
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                            <span className="text-xs text-gray-500">
                              {formatTime(message.timestamp)}
                            </span>
                            {isOwn && message.read && (
                              <span className="text-xs text-gray-500">· Leído</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-md mx-auto px-4 py-3">
          {/* Pending Attachments */}
          {attachments.length > 0 && (
            <div className="mb-3 space-y-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg"
                >
                  <div className="flex-shrink-0 text-primary">
                    {getFileIcon(attachment.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.size)}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 flex-shrink-0 text-gray-600 hover:bg-blue-100"
                    onClick={() => removeAttachment(attachment.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-end gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              className="hidden"
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full text-gray-600 hover:bg-gray-100 h-10 w-10 flex-shrink-0"
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Escribe un mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="bg-gray-50 border-gray-200 rounded-full px-4 resize-none"
              />
            </div>
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() && attachments.length === 0}
              className="rounded-full bg-primary hover:bg-blue-600 disabled:bg-gray-300 h-10 w-10 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}