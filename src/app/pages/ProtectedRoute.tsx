import { Navigate, Outlet } from "react-router-dom";

interface Props {
  allowedRole: string;
  children: any;
}

export default function ProtectedRoute({ allowedRole, children }: Props) {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Wronzzzzg role
  if (role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return <div>{children}</div>;
}
