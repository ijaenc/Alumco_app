// ─────────────────────────────────────────────────────────
// certificateService.ts — certificados
// ─────────────────────────────────────────────────────────
import { api } from "./api";

export interface Certificate {
  id: string;
  student_id: string;
  course_id: string;
  attempt_id: string;
  certificate_number: string;
  score: number;
  issued_at: string;
  status: "active" | "expired" | "revoked";
  course_title: string;
  student_name: string;
  instructor_name: string;
  instructor_email?: string;
}

export const certificateService = {
  // GET /certificates
  getAll: () => api.get<Certificate[]>("/certificates"),

  // GET /certificates/:id
  getById: (id: string) => api.get<Certificate>(`/certificates/${id}`),

  // GET /verify/:certNumber (público)
  verify: (certNumber: string) =>
    api.get<{ valid: boolean } & Certificate>(`/verify/${certNumber}`),

  // POST /certificates/:id/revoke (admin)
  revoke: (id: string) => api.post(`/certificates/${id}/revoke`, {}),
};
