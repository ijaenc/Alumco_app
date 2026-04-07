import { createBrowserRouter } from "react-router";
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

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/dashboard",
    Component: UserDashboard,
  },
  {
    path: "/training/:id",
    Component: TrainingDetail,
  },
  {
    path: "/evaluation/:id",
    Component: Evaluation,
  },
  {
    path: "/results/:id",
    Component: Results,
  },
  {
    path: "/messages",
    Component: Messages,
  },
  {
    path: "/chat/:id",
    Component: Chat,
  },
  {
    path: "/messages/new",
    Component: NewMessage,
  },
  {
    path: "/certificates",
    Component: Certificates,
  },
  {
    path: "/admin",
    Component: AdminDashboard,
  },
  {
    path: "/admin/panel",
    Component: AdminPanel,
  },
  {
    path: "/admin/reports",
    Component: Reports,
  },
  {
    path: "/admin/messages",
    Component: AdminMessages,
  },
  {
    path: "/admin/certifications",
    Component: AdminCertifications,
  },
]);