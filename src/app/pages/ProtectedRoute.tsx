import { Navigate } from "react-router-dom";

interface Props {
  allowedRole: string;
  children: React.ReactNode;
}

export default function ProtectedRoute({ allowedRole, children }: Props) {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}