// Service to manage users and their progress (for Admin)
export interface UserProgress {
  userId: string;
  userName: string;
  email: string;
  trainingId: string;
  trainingTitle: string;
  progress: number; // 0-100
  status: "not_started" | "in_progress" | "completed" | "failed";
  score?: number;
  attempts: number;
  maxAttempts: number;
  lastActivity: Date;
  certificateId?: string;
  certificateStatus?: "pending" | "issued" | "downloaded";
}

export interface UserSummary {
  userId: string;
  userName: string;
  email: string;
  avatar?: string;
  totalTrainings: number;
  completedTrainings: number;
  averageScore: number;
  lastActivity: Date;
  status: "active" | "inactive";
}

// Mock data for user progress
const mockUserProgress: UserProgress[] = [
  {
    userId: "user1",
    userName: "María García",
    email: "maria.garcia@ong.org",
    trainingId: "1",
    trainingTitle: "Derechos Humanos Fundamentales",
    progress: 100,
    status: "completed",
    score: 95,
    attempts: 1,
    maxAttempts: 2,
    lastActivity: new Date(2026, 2, 15),
    certificateId: "cert1",
    certificateStatus: "issued",
  },
  {
    userId: "user1",
    userName: "María García",
    email: "maria.garcia@ong.org",
    trainingId: "2",
    trainingTitle: "Gestión de Proyectos Sociales",
    progress: 45,
    status: "in_progress",
    attempts: 0,
    maxAttempts: 2,
    lastActivity: new Date(2026, 2, 18),
  },
  {
    userId: "user2",
    userName: "Carlos Rodríguez",
    email: "carlos.rodriguez@ong.org",
    trainingId: "1",
    trainingTitle: "Derechos Humanos Fundamentales",
    progress: 100,
    status: "completed",
    score: 88,
    attempts: 1,
    maxAttempts: 2,
    lastActivity: new Date(2026, 2, 12),
    certificateId: "cert4",
    certificateStatus: "issued",
  },
  {
    userId: "user2",
    userName: "Carlos Rodríguez",
    email: "carlos.rodriguez@ong.org",
    trainingId: "3",
    trainingTitle: "Comunicación Efectiva",
    progress: 30,
    status: "in_progress",
    attempts: 0,
    maxAttempts: 2,
    lastActivity: new Date(2026, 2, 17),
  },
  {
    userId: "user3",
    userName: "Ana Martínez",
    email: "ana.martinez@ong.org",
    trainingId: "1",
    trainingTitle: "Derechos Humanos Fundamentales",
    progress: 100,
    status: "failed",
    score: 65,
    attempts: 2,
    maxAttempts: 2,
    lastActivity: new Date(2026, 2, 10),
  },
  {
    userId: "user3",
    userName: "Ana Martínez",
    email: "ana.martinez@ong.org",
    trainingId: "2",
    trainingTitle: "Gestión de Proyectos Sociales",
    progress: 100,
    status: "completed",
    score: 92,
    attempts: 1,
    maxAttempts: 2,
    lastActivity: new Date(2026, 2, 14),
    certificateId: "cert5",
    certificateStatus: "issued",
  },
  {
    userId: "user4",
    userName: "Luis Hernández",
    email: "luis.hernandez@ong.org",
    trainingId: "1",
    trainingTitle: "Derechos Humanos Fundamentales",
    progress: 15,
    status: "in_progress",
    attempts: 0,
    maxAttempts: 2,
    lastActivity: new Date(2026, 2, 19),
  },
  {
    userId: "user5",
    userName: "Patricia López",
    email: "patricia.lopez@ong.org",
    trainingId: "2",
    trainingTitle: "Gestión de Proyectos Sociales",
    progress: 100,
    status: "completed",
    score: 90,
    attempts: 1,
    maxAttempts: 2,
    lastActivity: new Date(2026, 2, 16),
    certificateId: "cert6",
    certificateStatus: "downloaded",
  },
];

// Get all users summary
export function getUsersSummary(): UserSummary[] {
  const userMap = new Map<string, UserSummary>();

  mockUserProgress.forEach((progress) => {
    if (!userMap.has(progress.userId)) {
      const userProgresses = mockUserProgress.filter(
        (p) => p.userId === progress.userId
      );
      const completedCount = userProgresses.filter(
        (p) => p.status === "completed"
      ).length;
      const scoresSum = userProgresses
        .filter((p) => p.score !== undefined)
        .reduce((sum, p) => sum + (p.score || 0), 0);
      const scoresCount = userProgresses.filter(
        (p) => p.score !== undefined
      ).length;

      userMap.set(progress.userId, {
        userId: progress.userId,
        userName: progress.userName,
        email: progress.email,
        totalTrainings: userProgresses.length,
        completedTrainings: completedCount,
        averageScore: scoresCount > 0 ? Math.round(scoresSum / scoresCount) : 0,
        lastActivity: new Date(
          Math.max(...userProgresses.map((p) => p.lastActivity.getTime()))
        ),
        status: "active",
      });
    }
  });

  return Array.from(userMap.values()).sort(
    (a, b) => b.lastActivity.getTime() - a.lastActivity.getTime()
  );
}

// Get user progress by user ID
export function getUserProgress(userId: string): UserProgress[] {
  return mockUserProgress.filter((p) => p.userId === userId);
}

// Get all user progress (for admin overview)
export function getAllUserProgress(): UserProgress[] {
  return mockUserProgress.sort(
    (a, b) => b.lastActivity.getTime() - a.lastActivity.getTime()
  );
}

// Get users by training
export function getUsersByTraining(trainingId: string): UserProgress[] {
  return mockUserProgress.filter((p) => p.trainingId === trainingId);
}

// Get users with certificates ready
export function getUsersWithCertificates(): UserProgress[] {
  return mockUserProgress.filter(
    (p) => p.certificateId && p.certificateStatus === "issued"
  );
}

// Download user certificate (admin action)
export function downloadUserCertificate(
  userId: string,
  certificateId: string
): boolean {
  const progress = mockUserProgress.find(
    (p) => p.userId === userId && p.certificateId === certificateId
  );
  
  if (progress && progress.certificateId) {
    console.log(
      `Admin downloading certificate ${certificateId} for user ${userId}`
    );
    return true;
  }
  
  return false;
}

// Get statistics for admin dashboard
export function getAdminStatistics() {
  const totalUsers = new Set(mockUserProgress.map((p) => p.userId)).size;
  const totalCompletions = mockUserProgress.filter(
    (p) => p.status === "completed"
  ).length;
  const totalCertificates = mockUserProgress.filter(
    (p) => p.certificateId
  ).length;
  const averageProgress =
    mockUserProgress.reduce((sum, p) => sum + p.progress, 0) /
    mockUserProgress.length;

  return {
    totalUsers,
    totalCompletions,
    totalCertificates,
    averageProgress: Math.round(averageProgress),
    activeUsers: totalUsers, // All users are active in this mock
  };
}
