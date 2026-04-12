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
  sede?: string;
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
  sede?: string;
  created_at: string;
}

export const adminService = {
  getDashboardStats: () => api.get<DashboardStats>("/admin/stats"),
  getCourseStats: () => api.get<CourseStats[]>("/admin/courses/stats"),
  getEvaluationStats: () => api.get<any[]>("/admin/evaluation-stats"),
  getStudents: () => api.get<StudentSummary[]>("/admin/students"),
  getStudentProgress: (id: string) => api.get<{ student: any; enrollments: any[] }>(`/admin/students/${id}/progress`),
  getUsers: () => api.get<AdminUser[]>("/admin/users"),
  createUser: (data: { name: string; email: string; password: string; role: "student" | "teacher" | "admin"; sede?: string }) =>
    api.post<AdminUser>("/admin/users", data),
  updateUserStatus: (id: string, status: "active" | "inactive") =>
    api.patch(`/admin/users/${id}/status`, { status }),
  updateUserSede: (id: string, sede: string | null) =>
    api.patch(`/admin/users/${id}/sede`, { sede }),
};
