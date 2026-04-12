import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth";

// Controllers
import { login, register, getProfile, updateProfile } from "../controllers/authController";
import {
  getCourses, getCourseById, createCourse, updateCourse, deleteCourse,
  addModule, updateModule, deleteModule,
  enrollStudent, unenrollStudent, completeModule,
} from "../controllers/courseController";
import {
  getEvaluation, createEvaluation, updateEvaluation,
  submitAttempt, getAttempts, getMyAttempts, resetStudentAttempts,
} from "../controllers/evaluationController";
import {
  getCertificates, getCertificateById, verifyCertificate, revokeCertificate,
} from "../controllers/certificateController";
import {
  getConversations, getMessages, sendMessage, getUnreadCount, getAvailableUsers,
} from "../controllers/messageController";
import {
  getDashboardStats, getCourseStats, getAllStudents, getStudentProgress,
  getAllUsers, createUser, updateUserStatus, updateUserSede, getEvaluationStats,
} from "../controllers/adminController";

const router = Router();

// ────────────────────────────────────────────────────────────
// AUTH
// ────────────────────────────────────────────────────────────
router.post("/auth/login", login);
router.post("/auth/register", register);
router.get("/auth/me", authenticate, getProfile);
router.put("/auth/me", authenticate, updateProfile);

// ────────────────────────────────────────────────────────────
// COURSES
// ────────────────────────────────────────────────────────────
router.get("/courses", authenticate, getCourses);
router.get("/courses/:id", authenticate, getCourseById);
router.post("/courses", authenticate, requireRole("teacher", "admin"), createCourse);
router.put("/courses/:id", authenticate, requireRole("teacher", "admin"), updateCourse);
router.delete("/courses/:id", authenticate, requireRole("teacher", "admin"), deleteCourse);

// Modules (teacher creates course content)
router.post("/courses/:id/modules", authenticate, requireRole("teacher", "admin"), addModule);
router.put("/courses/:id/modules/:moduleId", authenticate, requireRole("teacher", "admin"), updateModule);
router.delete("/courses/:id/modules/:moduleId", authenticate, requireRole("teacher", "admin"), deleteModule);

// Enrollments (teacher assigns students)
router.post("/courses/:id/enroll", authenticate, requireRole("teacher", "admin"), enrollStudent);
router.delete("/courses/:id/enroll/:studentId", authenticate, requireRole("teacher", "admin"), unenrollStudent);

// Progress (student marks modules complete)
router.post("/courses/:id/modules/:moduleId/complete", authenticate, requireRole("student"), completeModule);

// ────────────────────────────────────────────────────────────
// EVALUATIONS
// ────────────────────────────────────────────────────────────
router.get("/evaluations/:id", authenticate, getEvaluation);
router.post("/evaluations", authenticate, requireRole("teacher", "admin"), createEvaluation);
router.put("/evaluations/:id", authenticate, requireRole("teacher", "admin"), updateEvaluation);

// Student submits answers
router.post("/evaluations/:id/submit", authenticate, requireRole("student"), submitAttempt);

// View attempts
router.get("/evaluations/:id/attempts", authenticate, requireRole("teacher", "admin"), getAttempts);
router.get("/evaluations/:id/my-attempts", authenticate, requireRole("student"), getMyAttempts);

// Admin can reset student attempts
router.delete("/evaluations/:id/attempts/:studentId", authenticate, requireRole("admin"), resetStudentAttempts);

// ────────────────────────────────────────────────────────────
// CERTIFICATES
// ────────────────────────────────────────────────────────────
router.get("/certificates", authenticate, getCertificates);
router.get("/certificates/:id", authenticate, getCertificateById);
router.post("/certificates/:id/revoke", authenticate, requireRole("admin"), revokeCertificate);

// Public endpoint (no auth needed for verification)
router.get("/verify/:certNumber", verifyCertificate);

// ────────────────────────────────────────────────────────────
// MESSAGES
// ────────────────────────────────────────────────────────────
router.get("/messages/unread-count", authenticate, getUnreadCount);
router.get("/messages/users", authenticate, getAvailableUsers);
router.get("/messages/conversations", authenticate, getConversations);
router.get("/messages/:peerId", authenticate, getMessages);
router.post("/messages", authenticate, sendMessage);

// ────────────────────────────────────────────────────────────
// ADMIN
// ────────────────────────────────────────────────────────────
router.get("/admin/stats", authenticate, requireRole("admin"), getDashboardStats);
router.get("/admin/courses/stats", authenticate, requireRole("admin", "teacher"), getCourseStats);
router.get("/admin/evaluation-stats", authenticate, requireRole("admin"), getEvaluationStats);

// Users management
router.get("/admin/users", authenticate, requireRole("admin"), getAllUsers);
router.post("/admin/users", authenticate, requireRole("admin"), createUser);
router.patch("/admin/users/:id/status", authenticate, requireRole("admin"), updateUserStatus);
router.patch("/admin/users/:id/sede", authenticate, requireRole("admin"), updateUserSede);

// Students
router.get("/admin/students", authenticate, requireRole("admin", "teacher"), getAllStudents);
router.get("/admin/students/:id/progress", authenticate, requireRole("admin", "teacher"), getStudentProgress);

export default router;
