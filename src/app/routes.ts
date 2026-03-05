import { createBrowserRouter } from "react-router-dom";
import Root from "./pages/Root";
import Login from "./pages/Login";
import {
  AdminAnalytics,
  AdminDash,
  AdminEscalatedIssues,
  AdminIssueDetail,
  AdminIssues,
  AdminSystem,
  StaffIssueDetail,
  StaffIssues,
  StudentDashboard,
  StudentHistory,
  StudentIssueDetail,
  StudentSettings,
  StudentSubmit,
  StudentTrack,
  TeacherDashboard,
} from "./routes/AllRoutes";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Login },

      { path: "/student", Component: StudentDashboard },
      { path: "/student/settings", Component: StudentSettings },
      {
        path: "/student/track/details/:issueId",
        Component: StudentIssueDetail,
      },
      { path: "/submit", Component: StudentSubmit },
      { path: "/track", Component: StudentTrack },
      { path: "/track/history", Component: StudentHistory },

      { path: "/staff/issues", Component: StaffIssues },
      { path: "/staff", Component: TeacherDashboard },
      { path: "/staff/issues/details/:issueId", Component: StaffIssueDetail },

      { path: "/admin", Component: AdminDash },
      { path: "/admin/issues", Component: AdminIssues },
      { path: "/admin/issues/:issueId", Component: AdminIssueDetail },
      { path: "/admin/analytics", Component: AdminAnalytics },
      { path: "/admin/escalated", Component: AdminEscalatedIssues },
      { path: "/admin/system", Component: AdminSystem },

      { path: "*", Component: Login },
    ],
  },
]);
