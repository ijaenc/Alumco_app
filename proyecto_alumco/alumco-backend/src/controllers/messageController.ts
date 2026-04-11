import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../db/database";
import { z } from "zod";

export async function getConversations(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const { userId } = req.user!;

  // Get all messages involving this user, find unique peers
  const sent = await db("messages").where({ sender_id: userId }).distinct("receiver_id as peer_id");
  const received = await db("messages").where({ receiver_id: userId }).distinct("sender_id as peer_id");
  const peerIds = [...new Set([...sent.map((r:any)=>r.peer_id), ...received.map((r:any)=>r.peer_id)])];

  const conversations = await Promise.all(peerIds.map(async (peerId: string) => {
    const peer = await db("users").where({ id: peerId }).select("id","name","role","avatar").first();
    const lastMsg = await db("messages")
      .where(function() { this.where({ sender_id: userId, receiver_id: peerId }).orWhere({ sender_id: peerId, receiver_id: userId }) })
      .orderBy("sent_at","desc").first();
    const unreadCount = await db("messages").where({ sender_id: peerId, receiver_id: userId, read: false }).count("id as cnt").first() as any;
    return { peer_id: peerId, peer_name: peer?.name, peer_role: peer?.role, peer_avatar: peer?.avatar, content: lastMsg?.content, sent_at: lastMsg?.sent_at, unread_count: unreadCount.cnt };
  }));

  conversations.sort((a:any,b:any) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
  res.json(conversations);
}

export async function getMessages(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const { peerId } = req.params;
  const { userId } = req.user!;

  await db("messages").where({ sender_id: peerId, receiver_id: userId, read: false }).update({ read: true });

  const messages = await db("messages as m").join("users as u","u.id","m.sender_id")
    .where(function() { this.where({ "m.sender_id": userId, "m.receiver_id": peerId }).orWhere({ "m.sender_id": peerId, "m.receiver_id": userId }) })
    .select("m.*","u.name as sender_name","u.role as sender_role").orderBy("m.sent_at","asc");

  const result = await Promise.all((messages as any[]).map(async (msg:any) => {
    const attachments = await db("message_attachments").where({ message_id: msg.id });
    return { ...msg, attachments };
  }));
  res.json(result);
}

export async function sendMessage(req: Request, res: Response): Promise<void> {
  const schema = z.object({ receiver_id: z.string().uuid(), content: z.string().min(1).max(2000) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Datos inválidos" }); return; }

  const db = getDb();
  const { receiver_id, content } = parsed.data;
  const { userId } = req.user!;

  const receiver = await db("users").where({ id: receiver_id }).first();
  if (!receiver) { res.status(404).json({ error: "Destinatario no encontrado" }); return; }

  const msgId = uuidv4();
  await db("messages").insert({ id: msgId, sender_id: userId, receiver_id, content, sent_at: new Date().toISOString() });

  const message = await db("messages as m").join("users as u","u.id","m.sender_id").where("m.id", msgId).select("m.*","u.name as sender_name").first();
  res.status(201).json(message);
}

export async function getUnreadCount(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const result = await db("messages").where({ receiver_id: req.user!.userId, read: false }).count("id as count").first() as any;
  res.json({ count: result.count });
}

export async function getAvailableUsers(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const { userId, role } = req.user!;

  let users: any[];
  if (role === "student") {
    users = await db("users as u").join("courses as c","c.instructor_id","u.id").join("enrollments as e","e.course_id","c.id")
      .where("e.student_id", userId).whereNot("u.id", userId).distinct("u.id","u.name","u.email","u.role","u.avatar").orderBy("u.name");
  } else if (role === "teacher") {
    users = await db("users as u").join("enrollments as e","e.student_id","u.id").join("courses as c","c.id","e.course_id")
      .where("c.instructor_id", userId).whereNot("u.id", userId).distinct("u.id","u.name","u.email","u.role","u.avatar").orderBy("u.name");
  } else {
    users = await db("users").whereNot({ id: userId }).select("id","name","email","role","avatar").orderBy("name");
  }
  res.json(users);
}
