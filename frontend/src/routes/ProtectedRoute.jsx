import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AUTH_ME_URL } from "../utils/api";

const ProtectedRoute = () => {
  const [authState, setAuthState] = useState("checking");
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          setAuthState("unauthenticated");
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
          localStorage.removeItem("user");
          setAuthState("unauthenticated");
          return;
        }

        const data = await response.json();

        const user = data.user;

        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
        }

        const userRole = user?.role?.toUpperCase();

        if (userRole === "STAFF") {
          setIsStaff(true);
        }

        setAuthState("authenticated");
      } catch (error) {
        console.error("Authentication Check Error:", error);
        setAuthState("unauthenticated");
      }
    };

    checkAuthentication();
  }, []);

  if (authState === "checking") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#e2e6ea]">
        <p className="text-sm text-deem-blue">
          Checking authentication...
        </p>
      </div>
    );
  }

  if (authState === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  // Staff cannot access the DEEM Web application
if (isStaff) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#e2e6ea] px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        <h2 className="text-2xl font-semibold text-deem-blue">
          Access Denied
        </h2>

        <p className="mt-4 text-sm leading-6 text-slate-500">
          You do not have permission to access
          <br />
          the DEEM Web application.
        </p>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          Please use the Employee mobile app
          <br />
          to continue.
        </p>
      </div>
    </div>
  );
}

  return <Outlet />;
};

export default ProtectedRoute;