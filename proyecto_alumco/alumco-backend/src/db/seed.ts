import { getDb, initSchema } from "./database";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

async function seed() {
  console.log("🔌 Conectando a Supabase...");
  await initSchema();
  const db = getDb();
  console.log("🧹 Limpiando datos anteriores...");

  // Borrar en orden inverso para respetar foreign keys
  await db("message_attachments").del();
  await db("messages").del();
  await db("certificates").del();
  await db("attempts").del();
  await db("module_progress").del();
  await db("enrollments").del();
  await db("options").del();
  await db("questions").del();
  await db("evaluations").del();
  await db("resources").del();
  await db("modules").del();
  await db("courses").del();
  await db("users").del();
  console.log("✅ Tablas limpias");

  console.log("🌱 Insertando datos...");
  const passwordHash = await bcrypt.hash("password123", 10);

  const adminId    = uuidv4(), teacher1Id = uuidv4(), teacher2Id = uuidv4();
  const student1Id = uuidv4(), student2Id = uuidv4(), student3Id = uuidv4();

  // ── USERS ──────────────────────────────────────────────────────────────────
  await db("users").insert([
    { id: adminId,    name: "Admin Principal",     email: "admin@alumco.org",          password: passwordHash, role: "admin",   status: "active" },
    { id: teacher1Id, name: "Dr. Juan Pérez",       email: "juan.perez@alumco.org",     password: passwordHash, role: "teacher", status: "active" },
    { id: teacher2Id, name: "Lic. María González",  email: "maria.gonzalez@alumco.org", password: passwordHash, role: "teacher", status: "active" },
    { id: student1Id, name: "Carlos Rodríguez",     email: "carlos@alumco.org",          password: passwordHash, role: "student", status: "active" },
    { id: student2Id, name: "Ana Martínez",          email: "ana@alumco.org",             password: passwordHash, role: "student", status: "active" },
    { id: student3Id, name: "Luis Hernández",        email: "luis@alumco.org",            password: passwordHash, role: "student", status: "active" },
  ]);
  console.log("✅ Usuarios");

  // ── COURSES ────────────────────────────────────────────────────────────────
  const course1Id = uuidv4(), course2Id = uuidv4(), course3Id = uuidv4();
  await db("courses").insert([
    { id: course1Id, title: "Derechos Humanos Fundamentales",  description: "Introducción completa a los derechos humanos fundamentales, su historia, evolución y aplicación.",  image_url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=250&fit=crop", duration: "2h 30min", instructor_id: teacher1Id, status: "published" },
    { id: course2Id, title: "Gestión de Proyectos Sociales",   description: "Aprende a gestionar proyectos comunitarios con metodologías probadas y herramientas prácticas.",   image_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop", duration: "3h 15min", instructor_id: teacher1Id, status: "published" },
    { id: course3Id, title: "Comunicación Efectiva",           description: "Técnicas de comunicación para el trabajo social y la gestión de equipos en organizaciones.",        image_url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=250&fit=crop", duration: "1h 45min", instructor_id: teacher2Id, status: "published" },
  ]);
  console.log("✅ Cursos");

  // ── MODULES ────────────────────────────────────────────────────────────────
  const c1m = [uuidv4(), uuidv4(), uuidv4(), uuidv4(), uuidv4()];
  await db("modules").insert([
    { id: c1m[0], course_id: course1Id, title: "Introducción a los DDHH",       type: "video",    duration: "25 min", order_index: 0 },
    { id: c1m[1], course_id: course1Id, title: "Historia y Evolución",           type: "video",    duration: "30 min", order_index: 1 },
    { id: c1m[2], course_id: course1Id, title: "Instrumentos Internacionales",   type: "video",    duration: "35 min", order_index: 2 },
    { id: c1m[3], course_id: course1Id, title: "Aplicación Práctica",            type: "video",    duration: "40 min", order_index: 3 },
    { id: c1m[4], course_id: course1Id, title: "Casos de Estudio",               type: "document", duration: "20 min", order_index: 4 },
    { id: uuidv4(), course_id: course2Id, title: "Fundamentos de PM Social",     type: "video",    duration: "30 min", order_index: 0 },
    { id: uuidv4(), course_id: course2Id, title: "Diagnóstico y Planificación",  type: "video",    duration: "35 min", order_index: 1 },
    { id: uuidv4(), course_id: course2Id, title: "Gestión de Recursos",          type: "video",    duration: "30 min", order_index: 2 },
    { id: uuidv4(), course_id: course2Id, title: "Monitoreo y Evaluación",       type: "video",    duration: "40 min", order_index: 3 },
    { id: uuidv4(), course_id: course2Id, title: "Casos Reales",                 type: "document", duration: "25 min", order_index: 4 },
    { id: uuidv4(), course_id: course2Id, title: "Herramientas Digitales",       type: "video",    duration: "35 min", order_index: 5 },
    { id: uuidv4(), course_id: course3Id, title: "Comunicación Asertiva",        type: "video",    duration: "25 min", order_index: 0 },
    { id: uuidv4(), course_id: course3Id, title: "Escucha Activa",               type: "video",    duration: "30 min", order_index: 1 },
    { id: uuidv4(), course_id: course3Id, title: "Comunicación No Verbal",       type: "video",    duration: "20 min", order_index: 2 },
    { id: uuidv4(), course_id: course3Id, title: "Resolución de Conflictos",     type: "video",    duration: "30 min", order_index: 3 },
  ]);
  console.log("✅ Módulos");

  // ── EVALUATIONS ────────────────────────────────────────────────────────────
  const eval1Id = uuidv4(), eval2Id = uuidv4(), eval3Id = uuidv4();
  await db("evaluations").insert([
    { id: eval1Id, course_id: course1Id, title: "Evaluación Final: Derechos Humanos",     description: "Evaluación de conocimientos sobre derechos humanos fundamentales", time_limit_min: 30, passing_score: 70, max_attempts: 2, wait_days: 14 },
    { id: eval2Id, course_id: course2Id, title: "Evaluación Final: Gestión de Proyectos", description: "Evaluación sobre gestión de proyectos sociales",                  time_limit_min: 40, passing_score: 70, max_attempts: 2, wait_days: 14 },
    { id: eval3Id, course_id: course3Id, title: "Evaluación Final: Comunicación",         description: "Evaluación sobre técnicas de comunicación",                       time_limit_min: 25, passing_score: 70, max_attempts: 2, wait_days: 14 },
  ]);

  // Helper preguntas
  async function addQ(evalId: string, text: string, opts: { text: string; correct: boolean }[], order: number) {
    const qId = uuidv4();
    await db("questions").insert({ id: qId, evaluation_id: evalId, text, order_index: order });
    await db("options").insert(opts.map((o, i) => ({ id: uuidv4(), question_id: qId, text: o.text, is_correct: o.correct, order_index: i })));
  }

  await addQ(eval1Id, "¿Qué documento establece los derechos humanos fundamentales a nivel internacional?", [
    { text: "La Constitución de las Naciones Unidas", correct: false },
    { text: "La Declaración Universal de los Derechos Humanos", correct: true },
    { text: "El Tratado de Ginebra", correct: false },
    { text: "La Carta de los Derechos Civiles", correct: false },
  ], 0);
  await addQ(eval1Id, "¿En qué año fue adoptada la Declaración Universal de los Derechos Humanos?", [
    { text: "1945", correct: false }, { text: "1948", correct: true },
    { text: "1950", correct: false }, { text: "1960", correct: false },
  ], 1);
  await addQ(eval1Id, "¿Cuál de los siguientes NO es un derecho humano fundamental?", [
    { text: "Derecho a la vida", correct: false }, { text: "Derecho a la educación", correct: false },
    { text: "Derecho al lujo", correct: true }, { text: "Derecho a la libertad de expresión", correct: false },
  ], 2);
  await addQ(eval1Id, "¿Qué organismo supervisa el cumplimiento de los derechos humanos?", [
    { text: "La OMS", correct: false }, { text: "El Consejo de Seguridad de la ONU", correct: false },
    { text: "La Corte Internacional de Justicia", correct: false }, { text: "El Consejo de Derechos Humanos de la ONU", correct: true },
  ], 3);
  await addQ(eval1Id, "¿Cuál es el principio fundamental de los derechos humanos?", [
    { text: "La reciprocidad", correct: false }, { text: "La universalidad", correct: true },
    { text: "La especialización", correct: false }, { text: "La regionalización", correct: false },
  ], 4);

  await addQ(eval2Id, "¿Cuál es la primera fase de un proyecto social?", [
    { text: "Implementación", correct: false }, { text: "Evaluación", correct: false },
    { text: "Diagnóstico", correct: true }, { text: "Cierre", correct: false },
  ], 0);
  await addQ(eval2Id, "¿Qué es un indicador de impacto?", [
    { text: "Una meta de corto plazo", correct: false },
    { text: "Una medida que refleja cambios en la comunidad a largo plazo", correct: true },
    { text: "Un recurso del proyecto", correct: false }, { text: "Un tipo de actividad", correct: false },
  ], 1);
  await addQ(eval2Id, "¿Qué sigla representa la herramienta de planificación más común?", [
    { text: "FODA", correct: false }, { text: "MML (Marco Lógico)", correct: true },
    { text: "KPI", correct: false }, { text: "ROI", correct: false },
  ], 2);

  await addQ(eval3Id, "¿Qué es la escucha activa?", [
    { text: "Oír sin prestar atención", correct: false },
    { text: "Prestar atención completa al emisor y comprender su mensaje", correct: true },
    { text: "Interrumpir para clarificar ideas", correct: false },
    { text: "Tomar notas de la conversación", correct: false },
  ], 0);
  await addQ(eval3Id, "¿Cuál es el porcentaje aproximado de comunicación no verbal?", [
    { text: "30%", correct: false }, { text: "55%", correct: true },
    { text: "70%", correct: false }, { text: "90%", correct: false },
  ], 1);
  console.log("✅ Evaluaciones y preguntas");

  // ── ENROLLMENTS ────────────────────────────────────────────────────────────
  await db("enrollments").insert([
    { id: uuidv4(), student_id: student1Id, course_id: course1Id, assigned_by: teacher1Id },
    { id: uuidv4(), student_id: student1Id, course_id: course2Id, assigned_by: teacher1Id },
    { id: uuidv4(), student_id: student2Id, course_id: course1Id, assigned_by: teacher1Id },
    { id: uuidv4(), student_id: student2Id, course_id: course2Id, assigned_by: teacher2Id },
    { id: uuidv4(), student_id: student3Id, course_id: course1Id, assigned_by: teacher1Id },
    { id: uuidv4(), student_id: student3Id, course_id: course3Id, assigned_by: teacher2Id },
  ]);
  console.log("✅ Inscripciones");

  // ── MODULE PROGRESS ────────────────────────────────────────────────────────
  await db("module_progress").insert([
    ...c1m.slice(0, 4).map(mId => ({ id: uuidv4(), student_id: student1Id, module_id: mId, completed: true, completed_at: new Date() })),
    ...c1m.map(mId => ({ id: uuidv4(), student_id: student2Id, module_id: mId, completed: true, completed_at: new Date() })),
  ]);
  console.log("✅ Progreso de módulos");

  // ── ATTEMPT + CERTIFICATE ──────────────────────────────────────────────────
  const attempt1Id = uuidv4();
  await db("attempts").insert({
    id: attempt1Id, student_id: student2Id, evaluation_id: eval1Id,
    score: 88, passed: true, answers: "{}", started_at: new Date(),
  });
  await db("certificates").insert({
    id: uuidv4(), student_id: student2Id, course_id: course1Id,
    attempt_id: attempt1Id, certificate_number: "CERT-2026-100001", score: 88, status: "active",
  });
  console.log("✅ Intentos y certificados");

  // ── MESSAGES ───────────────────────────────────────────────────────────────
  await db("messages").insert([
    { id: uuidv4(), sender_id: student1Id, receiver_id: teacher1Id, content: "Buenos días, quisiera consultar sobre mi evaluación de Derechos Humanos.", read: true  },
    { id: uuidv4(), sender_id: teacher1Id, receiver_id: student1Id, content: "¡Hola Carlos! Claro, dime en qué puedo ayudarte.", read: true  },
    { id: uuidv4(), sender_id: student1Id, receiver_id: teacher1Id, content: "Tengo dudas sobre la pregunta 3. ¿Podrías explicarme?", read: true  },
    { id: uuidv4(), sender_id: teacher1Id, receiver_id: student1Id, content: "Por supuesto. La respuesta se basa en el artículo 3 de la Declaración Universal.", read: false },
  ]);
  console.log("✅ Mensajes");

  console.log("\n🎉 ¡Seed completo en Supabase!");
  console.log("   admin@alumco.org          / password123  (admin)");
  console.log("   juan.perez@alumco.org     / password123  (teacher)");
  console.log("   carlos@alumco.org         / password123  (student)");

  await db.destroy();
}

seed().catch((e) => { console.error("❌ Error en seed:", e.message); process.exit(1); });
