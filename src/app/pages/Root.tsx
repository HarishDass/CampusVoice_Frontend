import { Outlet, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useMeQuery } from "../../services/api";
import { FullPageLoader } from "../components/Loader";
export default function Root() {
  const token = localStorage.getItem("accessToken");
  const { data, isLoading, isError } = useMeQuery(undefined, { skip: !token });
  useEffect(() => {
    if (data?.user) {
      localStorage.setItem("role", data.user.role);
    }
  }, [data]);
  if (isLoading) {
    return <FullPageLoader />;
  }
  if (!token || isError) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
