import knex, { Knex } from "knex";
import dotenv from "dotenv";

dotenv.config();

let _db: Knex | null = null;

export function getDb(): Knex {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL no está definida en .env");
    _db = knex({
      client: "pg",
      connection: { connectionString, ssl: { rejectUnauthorized: false } },
      pool: { min: 2, max: 10 },
    });
  }
  return _db;
}

async function createIfNotExists(db: Knex, tableName: string, builder: (t: Knex.CreateTableBuilder) => void) {
  const exists = await db.schema.hasTable(tableName);
  if (!exists) {
    await db.schema.createTable(tableName, builder);
    console.log(`  ✅ Tabla creada: ${tableName}`);
  }
}

export async function initSchema(): Promise<void> {
  const db = getDb();
  console.log("🔧 Verificando schema en Supabase...");

  await createIfNotExists(db, "users", (t) => {
    t.string("id").primary();
    t.string("name").notNullable();
    t.string("email").notNullable().unique();
    t.string("password").notNullable();
    t.string("role").notNullable();
    t.string("avatar").nullable();
    t.string("status").notNullable().defaultTo("active");
    t.timestamp("created_at").defaultTo(db.fn.now());
    t.timestamp("updated_at").defaultTo(db.fn.now());
  });

  await createIfNotExists(db, "courses", (t) => {
    t.string("id").primary();
    t.string("title").notNullable();
    t.text("description").notNullable();
    t.string("image_url").nullable();
    t.string("duration").nullable();
    t.string("instructor_id").notNullable().references("id").inTable("users");
    t.string("status").notNullable().defaultTo("draft");
    t.timestamp("created_at").defaultTo(db.fn.now());
    t.timestamp("updated_at").defaultTo(db.fn.now());
  });

  await createIfNotExists(db, "modules", (t) => {
    t.string("id").primary();
    t.string("course_id").notNullable().references("id").inTable("courses").onDelete("CASCADE");
    t.string("title").notNullable();
    t.text("description").nullable();
    t.string("type").notNullable().defaultTo("video");
    t.string("content_url").nullable();
    t.text("content").nullable();
    t.string("duration").nullable();
    t.integer("order_index").notNullable().defaultTo(0);
    t.timestamp("created_at").defaultTo(db.fn.now());
  });

  await createIfNotExists(db, "resources", (t) => {
    t.string("id").primary();
    t.string("course_id").notNullable().references("id").inTable("courses").onDelete("CASCADE");
    t.string("name").notNullable();
    t.string("file_url").notNullable();
    t.integer("size").nullable();
    t.timestamp("created_at").defaultTo(db.fn.now());
  });

  await createIfNotExists(db, "evaluations", (t) => {
    t.string("id").primary();
    t.string("course_id").notNullable().unique().references("id").inTable("courses").onDelete("CASCADE");
    t.string("title").notNullable();
    t.text("description").nullable();
    t.integer("time_limit_min").defaultTo(30);
    t.integer("passing_score").notNullable().defaultTo(70);
    t.integer("max_attempts").notNullable().defaultTo(2);
    t.integer("wait_days").notNullable().defaultTo(14);
    t.timestamp("created_at").defaultTo(db.fn.now());
    t.timestamp("updated_at").defaultTo(db.fn.now());
  });

  await createIfNotExists(db, "questions", (t) => {
    t.string("id").primary();
    t.string("evaluation_id").notNullable().references("id").inTable("evaluations").onDelete("CASCADE");
    t.text("text").notNullable();
    t.integer("order_index").notNullable().defaultTo(0);
    t.timestamp("created_at").defaultTo(db.fn.now());
  });

  await createIfNotExists(db, "options", (t) => {
    t.string("id").primary();
    t.string("question_id").notNullable().references("id").inTable("questions").onDelete("CASCADE");
    t.text("text").notNullable();
    t.boolean("is_correct").notNullable().defaultTo(false);
    t.integer("order_index").notNullable().defaultTo(0);
  });

  await createIfNotExists(db, "enrollments", (t) => {
    t.string("id").primary();
    t.string("student_id").notNullable().references("id").inTable("users");
    t.string("course_id").notNullable().references("id").inTable("courses");
    t.string("assigned_by").notNullable().references("id").inTable("users");
    t.timestamp("enrolled_at").defaultTo(db.fn.now());
    t.unique(["student_id", "course_id"]);
  });

  await createIfNotExists(db, "module_progress", (t) => {
    t.string("id").primary();
    t.string("student_id").notNullable().references("id").inTable("users");
    t.string("module_id").notNullable().references("id").inTable("modules").onDelete("CASCADE");
    t.boolean("completed").notNullable().defaultTo(false);
    t.timestamp("completed_at").nullable();
    t.unique(["student_id", "module_id"]);
  });

  await createIfNotExists(db, "attempts", (t) => {
    t.string("id").primary();
    t.string("student_id").notNullable().references("id").inTable("users");
    t.string("evaluation_id").notNullable().references("id").inTable("evaluations");
    t.integer("score").notNullable();
    t.boolean("passed").notNullable().defaultTo(false);
    t.text("answers").notNullable();
    t.timestamp("started_at").notNullable();
    t.timestamp("finished_at").defaultTo(db.fn.now());
  });

  await createIfNotExists(db, "certificates", (t) => {
    t.string("id").primary();
    t.string("student_id").notNullable().references("id").inTable("users");
    t.string("course_id").notNullable().references("id").inTable("courses");
    t.string("attempt_id").notNullable().unique().references("id").inTable("attempts");
    t.string("certificate_number").notNullable().unique();
    t.integer("score").notNullable();
    t.timestamp("issued_at").defaultTo(db.fn.now());
    t.string("status").notNullable().defaultTo("active");
  });

  await createIfNotExists(db, "messages", (t) => {
    t.string("id").primary();
    t.string("sender_id").notNullable().references("id").inTable("users");
    t.string("receiver_id").notNullable().references("id").inTable("users");
    t.text("content").notNullable();
    t.boolean("read").notNullable().defaultTo(false);
    t.timestamp("sent_at").defaultTo(db.fn.now());
  });

  await createIfNotExists(db, "message_attachments", (t) => {
    t.string("id").primary();
    t.string("message_id").notNullable().references("id").inTable("messages").onDelete("CASCADE");
    t.string("file_name").notNullable();
    t.string("file_url").notNullable();
    t.string("file_type").nullable();
    t.integer("file_size").nullable();
  });

  console.log("✅ Schema listo");
}

export default getDb;
