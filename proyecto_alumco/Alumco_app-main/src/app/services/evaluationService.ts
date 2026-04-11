// ─────────────────────────────────────────────────────────
// evaluationService.ts — evaluaciones e intentos
// ─────────────────────────────────────────────────────────
import { api } from "./api";

export interface Option {
  id: string;
  text: string;
  order_index: number;
  is_correct?: boolean; // solo visible para teacher/admin
}

export interface Question {
  id: string;
  text: string;
  order_index: number;
  options: Option[];
  // Campos presentes en resultados
  student_answer?: string;
  correct_option?: string;
  is_correct?: boolean;
}

export interface AttemptInfo {
  canAttempt: boolean;
  attemptsRemaining: number;
  message: string;
  unlockDate?: string;
  daysRemaining?: number;
  alreadyPassed?: boolean;
}

export interface EvaluationFull {
  id: string;
  course_id: string;
  course_title: string;
  title: string;
  description?: string;
  time_limit_min: number;
  passing_score: number;
  max_attempts: number;
  wait_days: number;
  questions: Question[];
  attemptInfo?: AttemptInfo;
}

export interface SubmitResult {
  attempt_id: string;
  score: number;
  passed: boolean;
  correct_answers: number;
  total_questions: number;
  passing_score: number;
  certificate?: {
    id: string;
    certificate_number: string;
    score: number;
    issued_at: string;
  } | null;
  questions: Question[];
  attempts_used: number;
  attempts_remaining: number;
}

export interface Attempt {
  id: string;
  score: number;
  passed: boolean;
  started_at: string;
  finished_at: string;
}

export const evaluationService = {
  // GET /evaluations/:id
  getById: (id: string) => api.get<EvaluationFull>(`/evaluations/${id}`),

  // POST /evaluations (teacher/admin)
  create: (data: {
    course_id: string;
    title: string;
    description?: string;
    time_limit_min?: number;
    passing_score?: number;
    max_attempts?: number;
    wait_days?: number;
    questions: {
      text: string;
      order_index?: number;
      options: { text: string; is_correct: boolean; order_index?: number }[];
    }[];
  }) => api.post<{ id: string }>("/evaluations", data),

  // PUT /evaluations/:id
  update: (
    id: string,
    data: {
      title?: string;
      description?: string;
      time_limit_min?: number;
      passing_score?: number;
      max_attempts?: number;
      wait_days?: number;
    }
  ) => api.put(`/evaluations/${id}`, data),

  // POST /evaluations/:id/submit (student)
  submit: (
    evaluationId: string,
    answers: Record<string, string>,
    startedAt: string
  ) =>
    api.post<SubmitResult>(`/evaluations/${evaluationId}/submit`, {
      answers,
      started_at: startedAt,
    }),

  // GET /evaluations/:id/my-attempts (student)
  getMyAttempts: (evaluationId: string) =>
    api.get<{ attempts: Attempt[]; attemptInfo: AttemptInfo }>(
      `/evaluations/${evaluationId}/my-attempts`
    ),

  // GET /evaluations/:id/attempts (teacher/admin)
  getAllAttempts: (evaluationId: string) =>
    api.get<any[]>(`/evaluations/${evaluationId}/attempts`),

  // DELETE /evaluations/:id/attempts/:studentId (admin)
  resetAttempts: (evaluationId: string, studentId: string) =>
    api.delete(`/evaluations/${evaluationId}/attempts/${studentId}`),
};
