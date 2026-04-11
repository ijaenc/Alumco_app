import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../db/database";
import { z } from "zod";

async function getAttemptInfo(studentId: string, evaluationId: string, evaluation: any) {
  const db = getDb();
  const maxAttempts = evaluation.max_attempts || 2;
  const waitDays = evaluation.wait_days || 14;

  const passed = await db("attempts").where({ student_id: studentId, evaluation_id: evaluationId, passed: true }).first();
  if (passed) return { canAttempt: false, attemptsRemaining: 0, message: "Ya aprobaste esta evaluación", alreadyPassed: true };

  const failedRows = await db("attempts").where({ student_id: studentId, evaluation_id: evaluationId, passed: false }).orderBy("finished_at","desc");
  const usedAttempts = failedRows.length;

  if (usedAttempts < maxAttempts) return { canAttempt: true, attemptsRemaining: maxAttempts - usedAttempts, message: "" };

  const lastFailed = failedRows[0]?.finished_at;
  if (lastFailed) {
    const unlockDate = new Date(lastFailed);
    unlockDate.setDate(unlockDate.getDate() + waitDays);
    const now = new Date();
    if (now >= unlockDate) return { canAttempt: true, attemptsRemaining: maxAttempts, message: "", resetAfterWait: true };
    const daysRemaining = Math.ceil((unlockDate.getTime() - now.getTime()) / (1000*60*60*24));
    return { canAttempt: false, attemptsRemaining: 0, unlockDate: unlockDate.toISOString(), daysRemaining, message: `Has agotado tus ${maxAttempts} intentos. Podrás intentarlo en ${daysRemaining} día${daysRemaining!==1?"s":""}` };
  }
  return { canAttempt: false, attemptsRemaining: 0, message: `Has agotado tus ${maxAttempts} intentos.` };
}

export async function getEvaluation(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const { id } = req.params;
  const { role, userId } = req.user!;

  const evaluation = await db("evaluations as e").join("courses as c","c.id","e.course_id")
    .where("e.id", id).select("e.*","c.title as course_title").first();
  if (!evaluation) { res.status(404).json({ error: "Evaluación no encontrada" }); return; }

  if (role === "student") {
    const enrollment = await db("enrollments").where({ student_id: userId, course_id: evaluation.course_id }).first();
    if (!enrollment) { res.status(403).json({ error: "No tienes acceso" }); return; }
  }

  const questions = await db("questions").where({ evaluation_id: id }).orderBy("order_index");
  for (const q of questions as any[]) {
    const optsQuery = db("options").where({ question_id: q.id }).orderBy("order_index");
    if (role === "student") optsQuery.select("id","text","order_index");
    q.options = await optsQuery;
  }

  if (role === "student") {
    const attemptInfo = await getAttemptInfo(userId, id, evaluation);
    if (!attemptInfo.canAttempt && !attemptInfo.alreadyPassed) { res.status(403).json({ error: attemptInfo.message, ...attemptInfo }); return; }
    res.json({ ...evaluation, questions, attemptInfo });
  } else {
    res.json({ ...evaluation, questions });
  }
}

export async function createEvaluation(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    course_id: z.string().uuid(),
    title: z.string().min(3),
    description: z.string().optional(),
    time_limit_min: z.number().int().positive().default(30),
    passing_score: z.number().int().min(1).max(100).default(70),
    max_attempts: z.number().int().min(1).default(2),
    wait_days: z.number().int().min(0).default(14),
    questions: z.array(z.object({
      text: z.string().min(5),
      order_index: z.number().int().min(0).default(0),
      options: z.array(z.object({ text: z.string().min(1), is_correct: z.boolean(), order_index: z.number().int().min(0).default(0) })).min(2),
    })).min(1),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() }); return; }

  const db = getDb();
  const { course_id, title, description, time_limit_min, passing_score, max_attempts, wait_days, questions } = parsed.data;

  for (const q of questions) {
    if (!q.options.some(o => o.is_correct)) { res.status(400).json({ error: `La pregunta "${q.text}" necesita al menos una respuesta correcta` }); return; }
  }

  const course = await db("courses").where({ id: course_id }).first();
  if (!course) { res.status(404).json({ error: "Curso no encontrado" }); return; }
  if (req.user!.role === "teacher" && course.instructor_id !== req.user!.userId) { res.status(403).json({ error: "Sin permiso" }); return; }

  const existing = await db("evaluations").where({ course_id }).first();
  if (existing) { res.status(409).json({ error: "Este curso ya tiene una evaluación" }); return; }

  const evalId = uuidv4();
  await db("evaluations").insert({ id: evalId, course_id, title, description: description||null, time_limit_min, passing_score, max_attempts, wait_days });
  for (const q of questions) {
    const qId = uuidv4();
    await db("questions").insert({ id: qId, evaluation_id: evalId, text: q.text, order_index: q.order_index });
    await db("options").insert(q.options.map((o, i) => ({ id: uuidv4(), question_id: qId, text: o.text, is_correct: o.is_correct, order_index: o.order_index })));
  }
  res.status(201).json({ message: "Evaluación creada", id: evalId });
}

export async function updateEvaluation(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const { id } = req.params;
  const { userId, role } = req.user!;
  const evaluation = await db("evaluations as e").join("courses as c","c.id","e.course_id").where("e.id",id).select("e.*","c.instructor_id").first();
  if (!evaluation) { res.status(404).json({ error: "Evaluación no encontrada" }); return; }
  if (role === "teacher" && evaluation.instructor_id !== userId) { res.status(403).json({ error: "Sin permiso" }); return; }
  const schema = z.object({ title: z.string().min(3).optional(), description: z.string().optional(), time_limit_min: z.number().int().positive().optional(), passing_score: z.number().int().min(1).max(100).optional(), max_attempts: z.number().int().min(1).optional(), wait_days: z.number().int().min(0).optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Datos inválidos" }); return; }
  await db("evaluations").where({ id }).update(parsed.data);
  res.json(await db("evaluations").where({ id }).first());
}

export async function submitAttempt(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const { id: evaluationId } = req.params;
  const { userId } = req.user!;

  const evaluation = await db("evaluations").where({ id: evaluationId }).first();
  if (!evaluation) { res.status(404).json({ error: "Evaluación no encontrada" }); return; }

  const enrollment = await db("enrollments").where({ student_id: userId, course_id: evaluation.course_id }).first();
  if (!enrollment) { res.status(403).json({ error: "No estás inscrito" }); return; }

  const attemptInfo = await getAttemptInfo(userId, evaluationId, evaluation);
  if (!attemptInfo.canAttempt) { res.status(403).json({ error: attemptInfo.message, ...attemptInfo }); return; }

  const schema = z.object({ answers: z.record(z.string(), z.string()), started_at: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Datos inválidos" }); return; }

  const { answers, started_at } = parsed.data;
  const questions = await db("questions").where({ evaluation_id: evaluationId });
  const correctOptions = await db("options as o").join("questions as q","q.id","o.question_id")
    .where({ "q.evaluation_id": evaluationId, "o.is_correct": true }).select("q.id as question_id","o.id as option_id");

  const correctMap = new Map(correctOptions.map((o:any) => [o.question_id, o.option_id]));
  let correct = 0;
  for (const q of questions as any[]) { if (answers[q.id] === correctMap.get(q.id)) correct++; }
  const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
  const passed = score >= (evaluation.passing_score || 70);

  const attemptId = uuidv4();
  await db("attempts").insert({ id: attemptId, student_id: userId, evaluation_id: evaluationId, score, passed, answers: JSON.stringify(answers), started_at, finished_at: new Date().toISOString() });

  let certificate = null;
  if (passed) {
    const existingCert = await db("certificates").where({ student_id: userId, course_id: evaluation.course_id }).first();
    if (!existingCert) {
      const certId = uuidv4();
      const certNumber = `CERT-${new Date().getFullYear()}-${String(Math.floor(Math.random()*999999)).padStart(6,"0")}`;
      await db("certificates").insert({ id: certId, student_id: userId, course_id: evaluation.course_id, attempt_id: attemptId, certificate_number: certNumber, score, status: "active" });
      certificate = await db("certificates").where({ id: certId }).first();
    }
  }

  const questionsWithAnswers = await Promise.all((questions as any[]).map(async (q:any) => {
    const opts = await db("options").where({ question_id: q.id }).orderBy("order_index");
    return { ...q, options: opts, student_answer: answers[q.id]||null, correct_option: correctMap.get(q.id), is_correct: answers[q.id] === correctMap.get(q.id) };
  }));

  const failedCount = await db("attempts").where({ student_id: userId, evaluation_id: evaluationId, passed: false }).count("id as cnt").first() as any;

  res.json({ attempt_id: attemptId, score, passed, correct_answers: correct, total_questions: questions.length, passing_score: evaluation.passing_score, certificate, questions: questionsWithAnswers, attempts_used: failedCount.cnt, attempts_remaining: passed ? 0 : Math.max(0, evaluation.max_attempts - failedCount.cnt) });
}

export async function getAttempts(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const attempts = await db("attempts as a").join("users as u","u.id","a.student_id")
    .where("a.evaluation_id", req.params.id).select("a.*","u.name as student_name","u.email as student_email").orderBy("a.finished_at","desc");
  res.json(attempts);
}

export async function getMyAttempts(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const { id } = req.params;
  const { userId } = req.user!;
  const evaluation = await db("evaluations").where({ id }).first();
  if (!evaluation) { res.status(404).json({ error: "Evaluación no encontrada" }); return; }
  const attempts = await db("attempts").select("id","score","passed","started_at","finished_at").where({ student_id: userId, evaluation_id: id }).orderBy("finished_at","desc");
  const attemptInfo = await getAttemptInfo(userId, id, evaluation);
  res.json({ attempts, attemptInfo });
}

export async function resetStudentAttempts(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const { id: evaluationId, studentId } = req.params;
  await db("attempts").where({ evaluation_id: evaluationId, student_id: studentId, passed: false }).delete();
  res.json({ message: "Intentos reiniciados correctamente" });
}
