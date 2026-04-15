import { Request, Response } from "express";
import { getDb } from "../db/database";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function getDashboardStats(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const totalStudents = ((await db("users").where({ role:"student" }).count("id as c").first()) as any).c;
  const totalCourses = ((await db("courses").count("id as c").first()) as any).c;
  const totalCertificates = ((await db("certificates").where({ status:"active" }).count("id as c").first()) as any).c;
  const totalAttempts = ((await db("attempts").count("id as c").first()) as any).c;
  const passedAttempts = ((await db("attempts").where({ passed:true }).count("id as c").first()) as any).c;
  const avgScore = ((await db("attempts").avg("score as avg").first()) as any).avg || 0;
  const activeEnrollments = ((await db("enrollments").count("id as c").first()) as any).c;

  const recentActivity = await db("attempts as a").join("users as u","u.id","a.student_id")
    .join("evaluations as e","e.id","a.evaluation_id").join("courses as c","c.id","e.course_id")
    .select("a.finished_at as date","u.name as student_name","c.title as course_title","a.score","a.passed").orderBy("a.finished_at","desc").limit(10);

  res.json({ totalStudents, totalCourses, totalCertificates, totalAttempts, passRate: totalAttempts>0 ? Math.round((passedAttempts/totalAttempts)*100) : 0, averageScore: Math.round(avgScore), activeEnrollments, recentActivity });
}

export async function getCourseStats(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const { role, userId } = req.user!;
  const coursesQuery = db("courses as c")
    .join("users as u", "u.id", "c.instructor_id")
    .select("c.*", "u.name as instructor_name");

  if (role === "teacher") {
    coursesQuery.where("c.instructor_id", userId);
  }

  const courses = await coursesQuery;

  const stats = await Promise.all(courses.map(async (course: any) => {
    const enrolled = ((await db("enrollments").where({ course_id: course.id }).count("id as c").first()) as any).c;
    const totalModules = ((await db("modules").where({ course_id: course.id }).count("id as c").first()) as any).c;
    const attemptRows = await db("attempts as a").join("evaluations as e","e.id","a.evaluation_id").where("e.course_id", course.id);
    const totalAttempts = attemptRows.length;
    const passedAttempts = attemptRows.filter((a:any) => a.passed).length;
    const avgScore = totalAttempts > 0 ? attemptRows.reduce((s:number,a:any)=>s+a.score,0)/totalAttempts : 0;
    const certs = ((await db("certificates").where({ course_id: course.id }).count("id as c").first()) as any).c;
    return {
      ...course,
      enrolled_students: Number(enrolled),
      total_modules: Number(totalModules),
      total_attempts: Number(totalAttempts),
      passed_attempts: Number(passedAttempts),
      average_score: Math.round(avgScore * 10) / 10,
      certificates_issued: Number(certs),
    };
  }));

  res.json(stats.sort((a:any,b:any) => b.enrolled_students - a.enrolled_students));
}

export async function getAllStudents(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const students = await db("users").where({ role:"student" }).select("id","name","email","status","created_at").orderBy("name");

  const result = await Promise.all(students.map(async (s:any) => {
    const enrollments = ((await db("enrollments").where({ student_id:s.id }).count("id as c").first()) as any).c;
    const certs = ((await db("certificates").where({ student_id:s.id }).count("id as c").first()) as any).c;
    const attempts = await db("attempts").where({ student_id:s.id });
    const avgScore = attempts.length > 0 ? attempts.reduce((sum:number,a:any)=>sum+a.score,0)/attempts.length : 0;
    const lastAttempt = attempts.sort((a:any,b:any)=>new Date(b.finished_at).getTime()-new Date(a.finished_at).getTime())[0];
    return { ...s, total_enrollments: enrollments, total_certificates: certs, total_attempts: attempts.length, average_score: Math.round(avgScore), last_activity: lastAttempt?.finished_at || s.created_at };
  }));
  res.json(result);
}

export async function getStudentProgress(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const { id } = req.params;
  const student = await db("users").where({ id, role:"student" }).select("id","name","email","status").first();
  if (!student) { res.status(404).json({ error: "Estudiante no encontrado" }); return; }

  const enrollments = await db("enrollments as e").join("courses as c","c.id","e.course_id").join("users as ins","ins.id","c.instructor_id")
    .where("e.student_id", id).select("e.*","c.id as course_id","c.title as course_title","ins.name as instructor_name");

  const enriched = await Promise.all(enrollments.map(async (en:any) => {
    const totalMods = ((await db("modules").where({ course_id: en.course_id }).count("id as c").first()) as any).c;
    const completedMods = ((await db("module_progress as mp").join("modules as m","mp.module_id","m.id")
      .where({ "m.course_id": en.course_id, "mp.student_id": id, "mp.completed": true }).count("mp.id as c").first()) as any).c;
    const bestAttempt = await db("attempts as at").join("evaluations as ev2","ev2.id","at.evaluation_id")
      .where({ "ev2.course_id": en.course_id, "at.student_id": id, "at.passed": true }).orderBy("at.score","desc").first();
    const attemptCount = ((await db("attempts as at2").join("evaluations as ev3","ev3.id","at2.evaluation_id")
      .where({ "ev3.course_id": en.course_id, "at2.student_id": id }).count("at2.id as c").first()) as any).c;
    const cert = await db("certificates").where({ student_id: id, course_id: en.course_id }).first();
    return { ...en, total_modules: totalMods, completed_modules: completedMods, best_score: bestAttempt?.score||null, attempt_count: attemptCount, certificate_number: cert?.certificate_number||null };
  }));

  res.json({ student, enrollments: enriched });
}

export async function getEvaluationStats(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const evaluations = await db("evaluations as ev").join("courses as c","c.id","ev.course_id").select("ev.*","c.title as course_title");

  const stats = await Promise.all(evaluations.map(async (ev:any) => {
    const attempts = await db("attempts").where({ evaluation_id: ev.id });
    const total = attempts.length;
    const passed = attempts.filter((a:any)=>a.passed).length;
    const scores = attempts.map((a:any)=>a.score);
    const uniqueStudents = new Set(attempts.map((a:any)=>a.student_id)).size;
    return { ...ev, total_attempts: total, passed_count: passed, average_score: total>0?Math.round(scores.reduce((s,n)=>s+n,0)/total):0, min_score: scores.length?Math.min(...scores):null, max_score: scores.length?Math.max(...scores):null, unique_students: uniqueStudents };
  }));
  res.json(stats);
}

export async function getAllUsers(req: Request, res: Response): Promise<void> {
  const db = getDb();
  res.json(await db("users").select("id","name","email","role","status","sede","created_at").orderBy("created_at","desc"));
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const schema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6), role: z.enum(["student","teacher","admin"]), sede: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Datos inválidos" }); return; }

  const db = getDb();
  const existing = await db("users").where({ email: parsed.data.email }).first();
  if (existing) { res.status(409).json({ error: "Email ya registrado" }); return; }

  const hash = await bcrypt.hash(parsed.data.password, 10);
  const id = uuidv4();
  await db("users").insert({ id, name: parsed.data.name, email: parsed.data.email, password: hash, role: parsed.data.role, sede: parsed.data.sede || null });
  res.status(201).json({ id, name: parsed.data.name, email: parsed.data.email, role: parsed.data.role });
}

export async function updateUserSede(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const { id } = req.params;
  const schema = z.object({ sede: z.string().nullable() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Datos inválidos" }); return; }
  await db("users").where({ id }).update({ sede: parsed.data.sede });
  res.json({ message: "Sede actualizada" });
}

export async function updateUserStatus(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const { id } = req.params;
  const schema = z.object({ status: z.enum(["active","inactive"]) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Datos inválidos" }); return; }
  await db("users").where({ id }).update({ status: parsed.data.status });
  res.json({ message: "Estado actualizado" });
}
