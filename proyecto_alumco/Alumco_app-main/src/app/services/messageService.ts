// ─────────────────────────────────────────────────────────
// messageService.ts — mensajería interna
// ─────────────────────────────────────────────────────────
import { api } from "./api";

export interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: "student" | "teacher" | "admin";
  receiver_id: string;
  content: string;
  read: boolean;
  sent_at: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
}

export interface Conversation {
  peer_id: string;
  peer_name: string;
  peer_role: "student" | "teacher" | "admin";
  peer_avatar?: string;
  content: string;
  sent_at: string;
  unread_count: number;
}

export interface AvailableUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export const messageService = {
  // GET /messages/conversations
  getConversations: () => api.get<Conversation[]>("/messages/conversations"),

  // GET /messages/:peerId
  getMessages: (peerId: string) => api.get<Message[]>(`/messages/${peerId}`),

  // POST /messages
  send: (receiverId: string, content: string) =>
    api.post<Message>("/messages", { receiver_id: receiverId, content }),

  // GET /messages/unread-count
  getUnreadCount: () =>
    api.get<{ count: number }>("/messages/unread-count"),

  // GET /messages/users
  getAvailableUsers: () => api.get<AvailableUser[]>("/messages/users"),
};
