import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useMeQuery } from "../../services/api";

const PUBLIC_ROUTES = ["/", "/forgot-password", "/verify-otp-reset"];

export default function Root() {
  const navigate = useNavigate();
  const location = useLocation();

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => location.pathname === route,
  );

  const { data, isLoading, isError } = useMeQuery(undefined, {
    skip: isPublicRoute,
  });

  useEffect(() => {
    if (isPublicRoute) return;

    if (isError) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("role");
      navigate("/", { replace: true });
    }
  }, [isError, isPublicRoute, navigate]);

  if (!isPublicRoute && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#080a0d] via-[#0f1419] to-[#1a1f2e]">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <Outlet />
    </div>
  );
}
