import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../db/database";
import { z } from "zod";

const courseSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  image_url: z.string().optional().nullable(),
  duration: z.string().optional(),
  status: z.enum(["draft","published","archived"]).optional(),
});

export async function getCourses(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const { role, userId } = req.user!;

  let courses: any[];
  if (role === "student") {
    courses = await db("courses as c")
      .join("enrollments as e", function() { this.on("e.course_id","=","c.id").andOn("e.student_id","=",db.raw("?", [userId])) })
      .join("users as u","c.instructor_id","u.id")
      .where("c.status","published")
      .select("c.*","u.name as instructor_name","e.enrolled_at")
      .orderBy("e.enrolled_at","desc");

    // Add progress per course
    for (const course of courses) {
      const totalMods = await db("modules").where({ course_id: course.id }).count("id as cnt").first() as any;
      const completedMods = await db("module_progress as mp")
        .join("modules as m","mp.module_id","m.id")
        .where({ "m.course_id": course.id, "mp.student_id": userId, "mp.completed": true })
        .count("mp.id as cnt").first() as any;
      course.total_modules = totalMods.cnt;
      course.completed_modules = completedMods.cnt;
    }
  } else if (role === "teacher") {
    courses = await db("courses as c")
      .join("users as u","c.instructor_id","u.id")
      .where("c.instructor_id", userId)
      .select("c.*","u.name as instructor_name")
      .orderBy("c.created_at","desc");
  } else {
    courses = await db("courses as c")
      .join("users as u","c.instructor_id","u.id")
      .select("c.*","u.name as instructor_name")
      .orderBy("c.created_at","desc");
  }
  res.json(courses);
}

export async function getCourseById(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const { id } = req.params;
  const { role, userId } = req.user!;

  const course = await db("courses as c").join("users as u","c.instructor_id","u.id")
    .where("c.id", id).select("c.*","u.name as instructor_name","u.email as instructor_email").first();
  if (!course) { res.status(404).json({ error: "Curso no encontrado" }); return; }

  if (role === "student") {
    const enrollment = await db("enrollments").where({ student_id: userId, course_id: id }).first();
    if (!enrollment) { res.status(403).json({ error: "No estás inscrito en este curso" }); return; }
  }

  const modules = await db("modules as m")
    .leftJoin("module_progress as mp", function() {
      this.on("mp.module_id","=","m.id").andOn("mp.student_id","=",db.raw("?", [role === "student" ? userId : null]))
    })
    .where("m.course_id", id)
    .select("m.*", db.raw("CASE WHEN mp.completed = true THEN 1 ELSE 0 END as completed"))
    .orderBy("m.order_index");

  const resources = await db("resources").where({ course_id: id }).orderBy("created_at","desc");
  const evaluation = await db("evaluations")
    .select("id","title","description","time_limit_min","passing_score","max_attempts","wait_days")
    .where({ course_id: id }).first();

  let progress = 0;
  if (role === "student") {
    const total = modules.length;
    const completed = modules.filter((m:any) => m.completed).length;
    progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  res.json({ ...course, modules, resources, evaluation: evaluation || null, progress });
}

export async function createCourse(req: Request, res: Response): Promise<void> {
  const parsed = courseSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Datos inválidos" }); return; }

  const db = getDb();
  const id = uuidv4();
  await db("courses").insert({ id, ...parsed.data, instructor_id: req.user!.userId, status: parsed.data.status || "draft" });
  res.status(201).json(await db("courses").where({ id }).first());
}

export async function updateCourse(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const { id } = req.params;
  const { role, userId } = req.user!;

  const course = await db("courses").where({ id }).first();
  if (!course) { res.status(404).json({ error: "Curso no encontrado" }); return; }
  if (role === "teacher" && course.instructor_id !== userId) { res.status(403).json({ error: "Sin permiso" }); return; }

  const parsed = courseSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Datos inválidos" }); return; }

  await db("courses").where({ id }).update(parsed.data);
  res.json(await db("courses").where({ id }).first());
}

export async function deleteCourse(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const { id } = req.params;
  const { role, userId } = req.user!;

  const course = await db("courses").where({ id }).first();
  if (!course) { res.status(404).json({ error: "Curso no encontrado" }); return; }
  if (role === "teacher" && course.instructor_id !== userId) { res.status(403).json({ error: "Sin permiso" }); return; }

  // Borrar en orden para respetar foreign keys
  await db("module_progress").whereIn("module_id",
    db("modules").where({ course_id: id }).select("id")
  ).delete();
  await db("attempts").whereIn("evaluation_id",
    db("evaluations").where({ course_id: id }).select("id")
  ).delete();
  await db("certificates").where({ course_id: id }).delete();
  await db("enrollments").where({ course_id: id }).delete();
  await db("options").whereIn("question_id",
    db("questions").whereIn("evaluation_id",
      db("evaluations").where({ course_id: id }).select("id")
    ).select("id")
  ).delete();
  await db("questions").whereIn("evaluation_id",
    db("evaluations").where({ course_id: id }).select("id")
  ).delete();
  await db("evaluations").where({ course_id: id }).delete();
  await db("modules").where({ course_id: id }).delete();
  await db("resources").where({ course_id: id }).delete();
  await db("courses").where({ id }).delete();
  res.json({ message: "Curso eliminado" });
}

export async function addModule(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const { id: courseId } = req.params;
  const { userId, role } = req.user!;

  const course = await db("courses").where({ id: courseId }).first();
  if (!course) { res.status(404).json({ error: "Curso no encontrado" }); return; }
  if (role === "teacher" && course.instructor_id !== userId) { res.status(403).json({ error: "Sin permiso" }); return; }

  const schema = z.object({ title: z.string().min(2), description: z.string().optional(), type: z.enum(["video","document","text"]).default("video"), content_url: z.string().optional(), content: z.string().optional(), duration: z.string().optional(), order_index: z.number().int().min(0).default(0) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Datos inválidos" }); return; }

  const modId = uuidv4();
  await db("modules").insert({ id: modId, course_id: courseId, ...parsed.data });
  res.status(201).json(await db("modules").where({ id: modId }).first());
}

export async function updateModule(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const { id: courseId, moduleId } = req.params;
  const { userId, role } = req.user!;
  const course = await db("courses").where({ id: courseId }).first();
  if (!course) { res.status(404).json({ error: "Curso no encontrado" }); return; }
  if (role === "teacher" && course.instructor_id !== userId) { res.status(403).json({ error: "Sin permiso" }); return; }

  const body = req.body;
  await db("modules").where({ id: moduleId }).update(body);
  res.json(await db("modules").where({ id: moduleId }).first());
}

export async function deleteModule(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const { id: courseId, moduleId } = req.params;
  const { userId, role } = req.user!;
  const course = await db("courses").where({ id: courseId }).first();
  if (!course) { res.status(404).json({ error: "Curso no encontrado" }); return; }
  if (role === "teacher" && course.instructor_id !== userId) { res.status(403).json({ error: "Sin permiso" }); return; }
  await db("modules").where({ id: moduleId }).delete();
  res.json({ message: "Módulo eliminado" });
}

export async function enrollStudent(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const { id: courseId } = req.params;
  const schema = z.object({ student_id: z.string().uuid() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "student_id requerido" }); return; }

  const student = await db("users").where({ id: parsed.data.student_id, role: "student" }).first();
  if (!student) { res.status(404).json({ error: "Estudiante no encontrado" }); return; }

  const existing = await db("enrollments").where({ student_id: parsed.data.student_id, course_id: courseId }).first();
  if (existing) { res.status(409).json({ error: "El estudiante ya está inscrito" }); return; }

  const id = uuidv4();
  await db("enrollments").insert({ id, student_id: parsed.data.student_id, course_id: courseId, assigned_by: req.user!.userId });
  res.status(201).json({ message: "Estudiante inscrito correctamente", enrollment_id: id });
}

export async function unenrollStudent(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const { id: courseId, studentId } = req.params;
  await db("enrollments").where({ student_id: studentId, course_id: courseId }).delete();
  res.json({ message: "Estudiante desinscrito correctamente" });
}

export async function completeModule(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const { id: courseId, moduleId } = req.params;
  const { userId } = req.user!;

  const enrollment = await db("enrollments").where({ student_id: userId, course_id: courseId }).first();
  if (!enrollment) { res.status(403).json({ error: "No estás inscrito en este curso" }); return; }

  const existing = await db("module_progress").where({ student_id: userId, module_id: moduleId }).first();
  if (existing) { res.json({ message: "Módulo ya completado" }); return; }

  await db("module_progress").insert({ id: uuidv4(), student_id: userId, module_id: moduleId, completed: true, completed_at: new Date().toISOString() });
  res.json({ message: "Módulo completado" });
}
