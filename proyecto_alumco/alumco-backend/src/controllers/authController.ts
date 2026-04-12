import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../db/database";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Datos inválidos" }); return; }

  const { email, password } = parsed.data;
  const db = getDb();
  const user = await db("users").where({ email }).first();

  if (!user) { res.status(401).json({ error: "Credenciales incorrectas" }); return; }
  if (user.status === "inactive") { res.status(403).json({ error: "Cuenta inactiva" }); return; }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) { res.status(401).json({ error: "Credenciales incorrectas" }); return; }

  const token = jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "7d" }
  );

  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
}

export async function register(req: Request, res: Response): Promise<void> {
  const schema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6), role: z.enum(["student","teacher","admin"]) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Datos inválidos" }); return; }

  const { name, email, password, role } = parsed.data;
  const db = getDb();
  const existing = await db("users").where({ email }).first();
  if (existing) { res.status(409).json({ error: "El email ya está registrado" }); return; }

  const hash = await bcrypt.hash(password, 10);
  const id = uuidv4();
  await db("users").insert({ id, name, email, password: hash, role });

  const token = jwt.sign({ userId: id, role, email }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });
  res.status(201).json({ token, user: { id, name, email, role } });
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const user = await db("users").select("id","name","email","role","avatar","status","sede","created_at").where({ id: req.user!.userId }).first();
  if (!user) { res.status(404).json({ error: "Usuario no encontrado" }); return; }
  res.json(user);
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const schema = z.object({ name: z.string().min(2).optional(), currentPassword: z.string().optional(), newPassword: z.string().min(6).optional(), sede: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Datos inválidos" }); return; }

  const db = getDb();
  const user = await db("users").where({ id: req.user!.userId }).first();

  if (parsed.data.newPassword) {
    if (!parsed.data.currentPassword) { res.status(400).json({ error: "Se requiere la contraseña actual" }); return; }
    const valid = await bcrypt.compare(parsed.data.currentPassword, user.password);
    if (!valid) { res.status(401).json({ error: "Contraseña actual incorrecta" }); return; }
    await db("users").where({ id: req.user!.userId }).update({ password: await bcrypt.hash(parsed.data.newPassword, 10) });
  }
  if (parsed.data.name) {
    await db("users").where({ id: req.user!.userId }).update({ name: parsed.data.name });
  }
  if (parsed.data.sede !== undefined) {
    await db("users").where({ id: req.user!.userId }).update({ sede: parsed.data.sede });
  }
  res.json({ message: "Perfil actualizado" });
}
