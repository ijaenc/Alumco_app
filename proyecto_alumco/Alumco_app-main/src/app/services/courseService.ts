// ─────────────────────────────────────────────────────────
// courseService.ts — cursos, módulos, inscripciones
// ─────────────────────────────────────────────────────────
import { api } from "./api";

export interface Course {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  duration?: string;
  instructor_name: string;
  instructor_email?: string;
  status: "draft" | "published" | "archived";
  total_modules?: number;
  completed_modules?: number;
  enrolled_students?: number;
  enrolled_at?: string;
  progress?: number;
  evaluation?: Evaluation | null;
  modules?: Module[];
  resources?: Resource[];
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  type: "video" | "document" | "text";
  content_url?: string;
  content?: string;
  duration?: string;
  order_index: number;
  completed?: boolean;
}

export interface Resource {
  id: string;
  course_id: string;
  name: string;
  file_url: string;
  size?: number;
}

export interface Evaluation {
  id: string;
  title: string;
  description?: string;
  time_limit_min: number;
  passing_score: number;
  max_attempts: number;
  wait_days: number;
}

export const courseService = {
  // GET /courses
  getAll: () => api.get<Course[]>("/courses"),

  // GET /courses/:id
  getById: (id: string) => api.get<Course>(`/courses/${id}`),

  // POST /courses (teacher/admin)
  create: (data: Partial<Course>) => api.post<Course>("/courses", data),

  // PUT /courses/:id (teacher/admin)
  update: (id: string, data: Partial<Course>) =>
    api.put<Course>(`/courses/${id}`, data),

  // DELETE /courses/:id
  delete: (id: string) => api.delete(`/courses/${id}`),

  // POST /courses/:id/modules
  addModule: (courseId: string, data: Partial<Module>) =>
    api.post<Module>(`/courses/${courseId}/modules`, data),

  // PUT /courses/:id/modules/:moduleId
  updateModule: (courseId: string, moduleId: string, data: Partial<Module>) =>
    api.put<Module>(`/courses/${courseId}/modules/${moduleId}`, data),

  // DELETE /courses/:id/modules/:moduleId
  deleteModule: (courseId: string, moduleId: string) =>
    api.delete(`/courses/${courseId}/modules/${moduleId}`),

  // POST /courses/:id/enroll (teacher assigns student)
  enrollStudent: (courseId: string, studentId: string) =>
    api.post(`/courses/${courseId}/enroll`, { student_id: studentId }),

  // DELETE /courses/:id/enroll/:studentId
  unenrollStudent: (courseId: string, studentId: string) =>
    api.delete(`/courses/${courseId}/enroll/${studentId}`),

  // POST /courses/:id/modules/:moduleId/complete (student)
  completeModule: (courseId: string, moduleId: string) =>
    api.post(`/courses/${courseId}/modules/${moduleId}/complete`, {}),
};
