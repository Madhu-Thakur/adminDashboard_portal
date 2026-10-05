import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AUTH_ME_URL } from "../utils/api";

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          setIsAuthenticated(false);
          return;
        }

        const response = await fetch(AUTH_ME_URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem("access_token");
          setIsAuthenticated(false);
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Authentication Check Error:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuthentication();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#e2e6ea]">
        <p className="text-sm text-deem-blue">
          Checking authentication...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;