// Service to manage internal messaging
export interface FileAttachment {
  id: string;
  name: string;
  type: string; // 'pdf', 'image', 'document'
  size: number; // in bytes
  url: string;
  uploadedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "user" | "admin";
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: Date;
  read: boolean;
  attachments?: FileAttachment[];
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: "user" | "admin";
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  avatar?: string;
  hasAttachment?: boolean;
}

// Mock data for conversations
const mockConversations: Conversation[] = [
  {
    id: "1",
    participantId: "admin1",
    participantName: "Dr. Juan Pérez",
    participantRole: "admin",
    lastMessage: "He revisado tu evaluación y está excelente. ¡Felicitaciones!",
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    unreadCount: 2,
  },
  {
    id: "2",
    participantId: "admin2",
    participantName: "Lic. María González",
    participantRole: "admin",
    lastMessage: "El nuevo material de capacitación ya está disponible.",
    lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    unreadCount: 0,
  },
  {
    id: "3",
    participantId: "support",
    participantName: "Soporte Técnico",
    participantRole: "admin",
    lastMessage: "¿Necesitas ayuda con algo más?",
    lastMessageTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    unreadCount: 0,
  },
];

// Mock data for messages
const mockMessages: { [conversationId: string]: Message[] } = {
  "1": [
    {
      id: "m1",
      senderId: "user1",
      senderName: "Tú",
      senderRole: "user",
      receiverId: "admin1",
      receiverName: "Dr. Juan Pérez",
      content: "Buenos días, quisiera consultar sobre mi evaluación de Derechos Humanos.",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: "m2",
      senderId: "admin1",
      senderName: "Dr. Juan Pérez",
      senderRole: "admin",
      receiverId: "user1",
      receiverName: "Tú",
      content: "¡Hola! Claro, dime en qué puedo ayudarte.",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: "m3",
      senderId: "user1",
      senderName: "Tú",
      senderRole: "user",
      receiverId: "admin1",
      receiverName: "Dr. Juan Pérez",
      content: "Tengo dudas sobre la pregunta 3. ¿Podrías explicarme por qué la respuesta correcta es esa?",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: "m4",
      senderId: "admin1",
      senderName: "Dr. Juan Pérez",
      senderRole: "admin",
      receiverId: "user1",
      receiverName: "Tú",
      content: "Por supuesto. La respuesta correcta se basa en el artículo 3 de la Declaración Universal de los Derechos Humanos.",
      timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: "m5",
      senderId: "admin1",
      senderName: "Dr. Juan Pérez",
      senderRole: "admin",
      receiverId: "user1",
      receiverName: "Tú",
      content: "He revisado tu evaluación y está excelente. ¡Felicitaciones!",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
    },
  ],
  "2": [
    {
      id: "m6",
      senderId: "admin2",
      senderName: "Lic. María González",
      senderRole: "admin",
      receiverId: "user1",
      receiverName: "Tú",
      content: "El nuevo material de capacitación ya está disponible.",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
    },
  ],
  "3": [
    {
      id: "m7",
      senderId: "user1",
      senderName: "Tú",
      senderRole: "user",
      receiverId: "support",
      receiverName: "Soporte Técnico",
      content: "No puedo acceder a mi certificado.",
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: "m8",
      senderId: "support",
      senderName: "Soporte Técnico",
      senderRole: "admin",
      receiverId: "user1",
      receiverName: "Tú",
      content: "Ya he solucionado el problema. Ahora deberías poder descargarlo.",
      timestamp: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: "m9",
      senderId: "support",
      senderName: "Soporte Técnico",
      senderRole: "admin",
      receiverId: "user1",
      receiverName: "Tú",
      content: "¿Necesitas ayuda con algo más?",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      read: true,
    },
  ],
};

// Get all conversations
export function getConversations(): Conversation[] {
  return mockConversations;
}

// Get messages for a conversation
export function getMessages(conversationId: string): Message[] {
  return mockMessages[conversationId] || [];
}

// Get unread messages count
export function getUnreadCount(): number {
  return mockConversations.reduce((acc, conv) => acc + conv.unreadCount, 0);
}

// Send a new message
export function sendMessage(
  conversationId: string,
  content: string,
  senderId: string = "user1",
  senderName: string = "Tú",
  attachments?: FileAttachment[]
): Message {
  const newMessage: Message = {
    id: `m${Date.now()}`,
    senderId,
    senderName,
    senderRole: senderId.startsWith("admin") ? "admin" : "user",
    receiverId: "",
    receiverName: "",
    content,
    timestamp: new Date(),
    read: false,
    attachments,
  };

  if (!mockMessages[conversationId]) {
    mockMessages[conversationId] = [];
  }
  mockMessages[conversationId].push(newMessage);

  // Update conversation last message
  const conversation = mockConversations.find((c) => c.id === conversationId);
  if (conversation) {
    conversation.lastMessage = attachments && attachments.length > 0 
      ? `📎 ${content || 'Archivo adjunto'}` 
      : content;
    conversation.lastMessageTime = new Date();
    conversation.hasAttachment = attachments && attachments.length > 0;
  }

  return newMessage;
}

// Mark conversation as read
export function markAsRead(conversationId: string): void {
  const conversation = mockConversations.find((c) => c.id === conversationId);
  if (conversation) {
    conversation.unreadCount = 0;
  }

  const messages = mockMessages[conversationId];
  if (messages) {
    messages.forEach((msg) => {
      if (msg.senderRole === "admin") {
        msg.read = true;
      }
    });
  }
}

// Create new conversation
export function createConversation(
  participantId: string,
  participantName: string,
  participantRole: "admin" = "admin"
): Conversation {
  const newConversation: Conversation = {
    id: `${Date.now()}`,
    participantId,
    participantName,
    participantRole,
    lastMessage: "",
    lastMessageTime: new Date(),
    unreadCount: 0,
  };

  mockConversations.unshift(newConversation);
  return newConversation;
}