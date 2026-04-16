import { createBrowserRouter } from "react-router-dom"; // Asegúrate de que diga react-router-dom
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import TrainingDetail from "./pages/TrainingDetail";
import Evaluation from "./pages/Evaluation";
import Results from "./pages/Results";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPanel from "./pages/AdminPanel";
import Reports from "./pages/Reports";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import NewMessage from "./pages/NewMessage";
import Certificates from "./pages/Certificates";
import AdminMessages from "./pages/AdminMessages";
import AdminCertifications from "./pages/AdminCertifications";
import AdminStudents from "./pages/AdminStudents";
import AdminTeachers from "./pages/AdminTeachers";
import AdminSedes from "./pages/AdminSedes";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherActiveCourses from "./pages/TeacherActiveCourses";
import TeacherStudentProgress from "./pages/TeacherStudentProgress";
import TeacherMessages from "./pages/TeacherMessages";
// 1. Agregamos tu nueva pantalla aquí:
import AdminTrainingsView from "./pages/AdminTrainingsView";
import AdminTrainingDetailView from "./pages/AdminTrainingDetailView";


export const router = createBrowserRouter([
  { path: "/", Component: Login },
  { path: "/dashboard", Component: UserDashboard },
  { path: "/training/:id", Component: TrainingDetail },
  { path: "/evaluation/:id", Component: Evaluation },
  { path: "/results/:id", Component: Results },
  { path: "/messages", Component: Messages },
  { path: "/chat/:id", Component: Chat },
  { path: "/messages/new", Component: NewMessage },
  { path: "/certificates", Component: Certificates },
  { path: "/admin", Component: AdminDashboard },
  { path: "/admin/panel", Component: AdminPanel },
  { path: "/admin/reports", Component: Reports },
  { path: "/admin/messages", Component: AdminMessages },
  { path: "/admin/certifications", Component: AdminCertifications },
  { path: "/admin/students", Component: AdminStudents },
  { path: "/admin/teachers", Component: AdminTeachers },
  { path: "/admin/sedes", Component: AdminSedes },
  { path: "/teacher", Component: TeacherDashboard },
  { path: "/teacher/courses", Component: TeacherActiveCourses },
  { path: "/teacher/students", Component: TeacherStudentProgress },
  { path: "/teacher/messages", Component: TeacherMessages },
  

  // 2. Y la registramos en el mapa aquí:
  { path: "/admin/trainings-view", Component: AdminTrainingsView },
  { path: "/admin/training-detail", Component: AdminTrainingDetailView },
]);