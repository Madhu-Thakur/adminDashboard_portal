import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";

import logo from "../assets/images/logo-1.png";
import { AUTH_RESET_PASSWORD_URL } from "../utils/api";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const email = sessionStorage.getItem("resetEmail");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
    toast.error("Reset session expired. Please try again.");
      navigate("/forgot-password");
      return;
    }

    if (!newPassword || !confirmPassword) {
    toast.error("Please enter both passwords");
      return;
    }

    if (newPassword !== confirmPassword) {
    toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(AUTH_RESET_PASSWORD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
       toast.error(data.message || "Unable to reset password");
        return;
      }

      console.log("Password reset successfully:", data);

    toast.success("Password reset successfully. Please login.");
 
      sessionStorage.removeItem("resetEmail");

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Reset Password Error:", error);
     toast.error("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#e2e6ea]">

      <div className="pointer-events-none absolute -left-28 -top-24 h-80 w-80 rounded-full border-28 border-deem-red/10 sm:h-96 sm:w-96" />

      <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full border-28 border-deem-blue/10 sm:h-96 sm:w-96" />

      <div className="pointer-events-none absolute -bottom-32 -left-28 h-80 w-80 rounded-full border-28 border-deem-blue/10 sm:h-96 sm:w-96" />

      <div className="pointer-events-none absolute -bottom-40 -right-28 h-96 w-96 rounded-full bg-deem-blue/4.5 sm:h-107.5" />

      <div className="pointer-events-none absolute right-[12%] top-[46%] h-24 w-24 rounded-full bg-deem-red/[0.07] sm:h-28 sm:w-28" />

      <div className="pointer-events-none absolute left-[14%] top-[22%] h-16 w-16 rounded-full bg-deem-blue/4" />

      {/* Main Content */}

      <main className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-6 sm:px-6">

        <div className="w-134.5 max-w-[calc(100vw-32px)]">

          {/* Same Card as Login */}

          <div className="rounded-[22px] border border-slate-100 bg-white px-7 py-7 shadow-[0_10px_30px_-5px_rgba(20,70,103,0.12)] sm:px-9 sm:py-8">

            {/* Logo */}

            <div className="flex justify-center">
              <img
                src={logo}
                alt="DEEM"
                className="w-32 object-contain sm:w-36"
              />
            </div>
 
            <div className="mt-5 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-deem-blue sm:text-3xl">
                Reset Password
              </h1>

              <p className="mt-1.5 text-sm text-slate-500 sm:text-[15px]">
                Enter your new password below.
              </p>
            </div>
 
            <form onSubmit={handleSubmit} className="mt-7">
 
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-2 block text-sm font-medium text-deem-blue"
                >
                  New Password
                </label>

                <div className="relative">

                  <Lock
                    size={18}
                    strokeWidth={1.8}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71839a]"
                  />

                  <input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    autoComplete="new-password"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-deem-blue outline-none transition placeholder:text-slate-400 focus:border-deem-red focus:ring-4 focus:ring-[#EB5141]/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword((prev) => !prev)
                    }
                    aria-label={
                      showNewPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71839a] transition hover:text-deem-red"
                  >
                    {showNewPassword ? (
                      <EyeOff size={18} strokeWidth={1.8} />
                    ) : (
                      <Eye size={18} strokeWidth={1.8} />
                    )}
                  </button>

                </div>
              </div>
 
              <div className="mt-4">
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-medium text-deem-blue"
                >
                  Confirm Password
                </label>

                <div className="relative">

                  <Lock
                    size={18}
                    strokeWidth={1.8}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71839a]"
                  />

                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Confirm your new password"
                    autoComplete="new-password"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-deem-blue outline-none transition placeholder:text-slate-400 focus:border-deem-red focus:ring-4 focus:ring-[#EB5141]/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71839a] transition hover:text-deem-red"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} strokeWidth={1.8} />
                    ) : (
                      <Eye size={18} strokeWidth={1.8} />
                    )}
                  </button>

                </div>
              </div>
 
              <button
                type="submit"
                disabled={loading}
                className="mt-5 flex h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-deem-red text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#d64334] active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-[#EB5141]/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>
                  {loading ? "Resetting..." : "Reset Password"}
                </span>

                {!loading && (
                  <ArrowRight
                    size={18}
                    strokeWidth={2}
                  />
                )}
              </button>

            </form>

          </div>

        </div>

      </main>
    </div>
  );
};

export default ResetPassword;