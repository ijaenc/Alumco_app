// Service to manage certificates
export interface Certificate {
  id: string;
  trainingId: string;
  trainingTitle: string;
  issueDate: Date;
  score: number;
  instructor: string;
  certificateNumber: string;
  status: "active" | "expired";
  downloadUrl?: string;
}

// Mock certificates data
const mockCertificates: Certificate[] = [
  {
    id: "cert1",
    trainingId: "1",
    trainingTitle: "Derechos Humanos Fundamentales",
    issueDate: new Date(2026, 2, 15), // March 15, 2026
    score: 95,
    instructor: "Dr. Juan Pérez",
    certificateNumber: "CERT-2026-001234",
    status: "active",
  },
  {
    id: "cert2",
    trainingId: "2",
    trainingTitle: "Ética Profesional en ONGs",
    issueDate: new Date(2026, 1, 28), // February 28, 2026
    score: 88,
    instructor: "Lic. María González",
    certificateNumber: "CERT-2026-001189",
    status: "active",
  },
  {
    id: "cert3",
    trainingId: "3",
    trainingTitle: "Gestión de Proyectos Sociales",
    issueDate: new Date(2026, 0, 10), // January 10, 2026
    score: 92,
    instructor: "Ing. Carlos Rodríguez",
    certificateNumber: "CERT-2026-001045",
    status: "active",
  },
];

// Get all certificates
export function getCertificates(): Certificate[] {
  return mockCertificates.sort((a, b) => b.issueDate.getTime() - a.issueDate.getTime());
}

// Get certificate by ID
export function getCertificateById(id: string): Certificate | undefined {
  return mockCertificates.find((cert) => cert.id === id);
}

// Get certificate by training ID
export function getCertificateByTrainingId(trainingId: string): Certificate | undefined {
  return mockCertificates.find((cert) => cert.trainingId === trainingId);
}

// Add new certificate
export function addCertificate(
  trainingId: string,
  trainingTitle: string,
  score: number,
  instructor: string
): Certificate {
  const newCertificate: Certificate = {
    id: `cert${mockCertificates.length + 1}`,
    trainingId,
    trainingTitle,
    issueDate: new Date(),
    score,
    instructor,
    certificateNumber: `CERT-${new Date().getFullYear()}-${String(
      Math.floor(Math.random() * 999999)
    ).padStart(6, "0")}`,
    status: "active",
  };

  mockCertificates.push(newCertificate);
  return newCertificate;
}

// Download certificate (simulate download)
export function downloadCertificate(certificateId: string): boolean {
  const certificate = getCertificateById(certificateId);
  if (!certificate) return false;

  // In a real app, this would trigger a PDF download
  console.log(`Downloading certificate: ${certificate.certificateNumber}`);
  return true;
}

// Get total certificates count
export function getCertificatesCount(): number {
  return mockCertificates.length;
}
