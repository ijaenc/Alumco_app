// ─────────────────────────────────────────────────────────
// adminService.ts — estadísticas y gestión de usuarios
// ─────────────────────────────────────────────────────────
import { api } from "./api";

export interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  totalCertificates: number;
  totalAttempts: number;
  passRate: number;
  averageScore: number;
  activeEnrollments: number;
  recentActivity: {
    date: string;
    student_name: string;
    course_title: string;
    score: number;
    passed: boolean;
  }[];
}

export interface CourseStats {
  id: string;
  title: string;
  instructor_name: string;
  status: string;
  enrolled_students: number;
  total_modules: number;
  total_attempts: number;
  passed_attempts: number;
  average_score: number;
  certificates_issued: number;
}

export interface StudentSummary {
  id: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
  total_enrollments: number;
  total_certificates: number;
  total_attempts: number;
  average_score: number;
  last_activity: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  status: "active" | "inactive";
  created_at: string;
}

export const adminService = {
  // GET /admin/stats
  getDashboardStats: () => api.get<DashboardStats>("/admin/stats"),

  // GET /admin/courses/stats
  getCourseStats: () => api.get<CourseStats[]>("/admin/courses/stats"),

  // GET /admin/evaluation-stats
  getEvaluationStats: () => api.get<any[]>("/admin/evaluation-stats"),

  // GET /admin/students
  getStudents: () => api.get<StudentSummary[]>("/admin/students"),

  // GET /admin/students/:id/progress
  getStudentProgress: (id: string) =>
    api.get<{ student: any; enrollments: any[] }>(`/admin/students/${id}/progress`),

  // GET /admin/users
  getUsers: () => api.get<AdminUser[]>("/admin/users"),

  // POST /admin/users
  createUser: (data: {
    name: string;
    email: string;
    password: string;
    role: "student" | "teacher" | "admin";
  }) => api.post<AdminUser>("/admin/users", data),

  // PATCH /admin/users/:id/status
  updateUserStatus: (id: string, status: "active" | "inactive") =>
    api.patch(`/admin/users/${id}/status`, { status }),
};
