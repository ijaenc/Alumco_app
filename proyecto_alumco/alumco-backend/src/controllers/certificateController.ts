import { Request, Response } from "express";
import { getDb } from "../db/database";

export async function getCertificates(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const { role, userId } = req.user!;

  let query = db("certificates as cert").join("courses as c","c.id","cert.course_id")
    .join("users as u","u.id","cert.student_id").join("users as ins","ins.id","c.instructor_id")
    .select("cert.*","c.title as course_title","u.name as student_name","ins.name as instructor_name")
    .orderBy("cert.issued_at","desc");

  if (role === "student") query = query.where("cert.student_id", userId);
  else if (role === "teacher") query = query.where("c.instructor_id", userId);

  res.json(await query);
}

export async function getCertificateById(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const { id } = req.params;
  const { role, userId } = req.user!;

  const cert = await db("certificates as cert").join("courses as c","c.id","cert.course_id")
    .join("users as u","u.id","cert.student_id").join("users as ins","ins.id","c.instructor_id")
    .where("cert.id", id).select("cert.*","c.title as course_title","u.name as student_name","ins.name as instructor_name","ins.email as instructor_email").first();

  if (!cert) { res.status(404).json({ error: "Certificado no encontrado" }); return; }
  if (role === "student" && cert.student_id !== userId) { res.status(403).json({ error: "Sin permiso" }); return; }
  res.json(cert);
}

export async function verifyCertificate(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const cert = await db("certificates as cert").join("courses as c","c.id","cert.course_id")
    .join("users as u","u.id","cert.student_id").join("users as ins","ins.id","c.instructor_id")
    .where("cert.certificate_number", req.params.certNumber)
    .select("cert.id","cert.certificate_number","cert.score","cert.issued_at","cert.status","c.title as course_title","u.name as student_name","ins.name as instructor_name").first();

  if (!cert) { res.status(404).json({ valid: false, error: "Certificado no encontrado" }); return; }
  res.json({ valid: cert.status === "active", ...cert });
}

export async function revokeCertificate(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const { id } = req.params;
  const cert = await db("certificates").where({ id }).first();
  if (!cert) { res.status(404).json({ error: "Certificado no encontrado" }); return; }
  await db("certificates").where({ id }).update({ status: "revoked" });
  res.json({ message: "Certificado revocado" });
}
