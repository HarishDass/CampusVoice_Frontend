import CitizenDashboard from "../pages/CitizenDashboard";
import SubmitGrievance from "../pages/SubmitGrievance";
import TrackStatus from "../pages/TrackStatus";
import History from "../pages/History";
import Settings from "../pages/Settings";
import AdminDashboard from "../pages/AdminDashboard";
import AllIssues from "../pages/AllIssues";
import Analytics from "../pages/Analytics";
import StudentIssueDetails from "../pages/StudentIssueDetails";
import System from "../pages/System";
import ProtectedRoute from "../pages/ProtectedRoute";
import StaffIssueDetails from "../pages/StaffIssueDetails";
import StaffDashboard from "../pages/StaffDashboard";
import AdminAllIssues from "../pages/AdminAllIssues";
import EscalatedIssues from "../pages/EscalatedIssues";
import AdminIssueDetails from "../pages/AdminIssueDetails";

export const StudentDashboard = () => (
  <ProtectedRoute allowedRole="student">
    <CitizenDashboard />
  </ProtectedRoute>
);

export const StudentSettings = () => (
  <ProtectedRoute allowedRole="student">
    <Settings />
  </ProtectedRoute>
);

export const StudentSubmit = () => (
  <ProtectedRoute allowedRole="student">
    <SubmitGrievance />
  </ProtectedRoute>
);

export const StudentTrack = () => (
  <ProtectedRoute allowedRole="student">
    <TrackStatus />
  </ProtectedRoute>
);
export const StudentIssueDetail = () => (
  <ProtectedRoute allowedRole="student">
    <StudentIssueDetails />
  </ProtectedRoute>
);
export const StaffIssueDetail = () => (
  <ProtectedRoute allowedRole="staff">
    <StaffIssueDetails />
  </ProtectedRoute>
);

export const StudentHistory = () => (
  <ProtectedRoute allowedRole="student">
    <History />
  </ProtectedRoute>
);

export const TeacherDashboard = () => (
  <ProtectedRoute allowedRole="staff">
    <StaffDashboard />
  </ProtectedRoute>
);
export const StaffIssues = () => (
  <ProtectedRoute allowedRole="staff">
    <AllIssues />
  </ProtectedRoute>
);

export const AdminDash = () => (
  <ProtectedRoute allowedRole="admin">
    <AdminDashboard />
  </ProtectedRoute>
);
export const AdminEscalatedIssues = () => (
  <ProtectedRoute allowedRole="admin">
    <EscalatedIssues />
  </ProtectedRoute>
);

export const AdminIssues = () => (
  <ProtectedRoute allowedRole="admin">
    <AdminAllIssues />
  </ProtectedRoute>
);

export const AdminAnalytics = () => (
  <ProtectedRoute allowedRole="admin">
    <Analytics />
  </ProtectedRoute>
);
export const AdminIssueDetail = () => (
  <ProtectedRoute allowedRole="admin">
    <AdminIssueDetails />
  </ProtectedRoute>
);

export const AdminSystem = () => (
  <ProtectedRoute allowedRole="admin">
    <System />
  </ProtectedRoute>
);
