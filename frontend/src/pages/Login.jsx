import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/logo-1.png";
import {
  AUTH_LOGIN_URL,
  AUTH_FORGOT_PASSWORD_URL,
  AUTH_VERIFY_OTP_URL,
  AUTH_RESET_PASSWORD_URL,
} from "../utils/api";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Check, X } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);

  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [forgotLoading, setForgotLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // send otp
  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      alert("Please enter your email address");
      return;
    }

    try {
      setForgotLoading(true);

      const response = await fetch(AUTH_FORGOT_PASSWORD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: forgotEmail.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to send OTP");
        return;
      }

      alert("OTP sent successfully to your email");

      setForgotStep(2);
    } catch (error) {
      console.error("Forgot Password Error:", error);
      alert("Unable to connect to server");
    } finally {
      setForgotLoading(false);
    }
  };

  // verify otp

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      alert("Please enter the OTP");
      return;
    }

    try {
      setForgotLoading(true);

      const response = await fetch(AUTH_VERIFY_OTP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: forgotEmail.trim(),
          otp: otp.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Invalid OTP");
        return;
      }

      alert("OTP verified successfully");

      setForgotStep(3);
    } catch (error) {
      console.error("Verify OTP Error:", error);
      alert("Unable to connect to server");
    } finally {
      setForgotLoading(false);
    }
  };

  // reset password
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      alert("Please enter both passwords");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setForgotLoading(true);

      const response = await fetch(AUTH_RESET_PASSWORD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: forgotEmail.trim(),
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to reset password");
        return;
      }

      alert("Password reset successfully. Please login.");

      setShowForgotPassword(false);
      setForgotStep(1);
      setForgotEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Reset Password Error:", error);
      alert("Unable to connect to server");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(AUTH_LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      console.log("Login successful:", data);

      const userRole = data.user?.role?.toUpperCase();

      if (userRole === "ADMIN") {
        navigate("/dashboard");
        return;
      }

      if (userRole === "STAFF") {
        alert("Staff users should use the Employee mobile app.");
        return;
      }

      alert("You are not authorized to access this application.");
    } catch (error) {
      console.error("Login Error:", error);
      alert("Unable to connect to server");
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

    <main className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-6 sm:px-6">
      <div className="w-full max-w-125">
        <div className="rounded-[22px] border border-slate-100 bg-white px-7 py-7 shadow-[0_10px_30px_-5px_rgba(20,70,103,0.12)] sm:px-9 sm:py-8">

          <div className="flex justify-center">
            <img
              src={logo}
              alt="DEEM"
              className="w-32 object-contain sm:w-36"
            />
          </div>

          <div className="mt-5 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-deem-blue sm:text-3xl">
              Welcome Back!
            </h1>

            <p className="mt-1.5 text-sm text-slate-500 sm:text-[15px]">
              Login to continue to DEEM Portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7">

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-deem-blue"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  strokeWidth={1.8}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71839a]"
                />

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email ID"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-deem-blue outline-none transition placeholder:text-slate-400 focus:border-deem-red focus:ring-4 focus:ring-[#EB5141]/10"
                />
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-deem-blue"
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  strokeWidth={1.8}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71839a]"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-deem-blue outline-none transition placeholder:text-slate-400 focus:border-deem-red focus:ring-4 focus:ring-[#EB5141]/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71839a] transition hover:text-deem-red"
                >
                  {showPassword ? (
                    <EyeOff size={18} strokeWidth={1.8} />
                  ) : (
                    <Eye size={18} strokeWidth={1.8} />
                  )}
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">

              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-500">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />

                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${
                    rememberMe
                      ? "border-deem-red bg-deem-red"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {rememberMe && (
                    <Check
                      size={13}
                      strokeWidth={3}
                      className="text-white"
                    />
                  )}
                </span>

                <span>Remember Me</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setForgotEmail(formData.email);
                  setForgotStep(1);
                  setShowForgotPassword(true);
                }}
                className="text-sm font-medium text-deem-blue transition hover:text-deem-red hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="mt-5 flex h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-deem-red text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#d64334] active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-[#EB5141]/20"
            >
              <span>Login</span>

              <ArrowRight size={18} strokeWidth={2} />
            </button>
          </form>
        </div>
      </div>
    </main>

    {/* Forgot Password Modal */}
    {showForgotPassword && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

          {/* Close Button */}
          <button
            type="button"
            onClick={() => setShowForgotPassword(false)}
            className="absolute right-4 top-4 text-slate-400 transition hover:text-deem-red"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* STEP 1 - Enter Email */}
          {forgotStep === 1 && (
            <>
              <h2 className="text-xl font-semibold text-deem-blue">
                Forgot Password
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter your email address to receive an OTP.
              </p>

              <div className="mt-5">
                <label
                  htmlFor="forgotEmail"
                  className="mb-2 block text-sm font-medium text-deem-blue"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71839a]"
                  />

                  <input
                    id="forgotEmail"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your email ID"
                    className="h-11 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm text-deem-blue outline-none focus:border-deem-red focus:ring-4 focus:ring-[#EB5141]/10"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={forgotLoading}
                className="mt-5 h-11 w-full rounded-xl bg-deem-red text-sm font-semibold text-white transition hover:bg-[#d64334] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {forgotLoading ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          )}

          {/* STEP 2 - Verify OTP */}
          {forgotStep === 2 && (
            <>
              <h2 className="text-xl font-semibold text-deem-blue">
                Verify OTP
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter the OTP sent to your email.
              </p>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Enter 6-digit OTP"
                className="mt-5 h-11 w-full rounded-xl border border-slate-200 px-4 text-center text-lg tracking-[6px] text-deem-blue outline-none focus:border-deem-red focus:ring-4 focus:ring-[#EB5141]/10"
              />

              <button
                type="button"
                onClick={handleVerifyOTP}
                disabled={forgotLoading}
                className="mt-5 h-11 w-full rounded-xl bg-deem-red text-sm font-semibold text-white transition hover:bg-[#d64334] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {forgotLoading ? "Verifying..." : "Verify OTP"}
              </button>
            </>
          )}

          {/* STEP 3 - Reset Password */}
          {forgotStep === 3 && (
            <>
              <h2 className="text-xl font-semibold text-deem-blue">
                Reset Password
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter your new password.
              </p>

              <div className="mt-5">
                <label
                  htmlFor="newPassword"
                  className="mb-2 block text-sm font-medium text-deem-blue"
                >
                  New Password
                </label>

                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-deem-blue outline-none focus:border-deem-red focus:ring-4 focus:ring-[#EB5141]/10"
                />
              </div>

              <div className="mt-4">
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-deem-blue"
                >
                  Confirm Password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-deem-blue outline-none focus:border-deem-red focus:ring-4 focus:ring-[#EB5141]/10"
                />
              </div>

              <button
                type="button"
                onClick={handleResetPassword}
                disabled={forgotLoading}
                className="mt-5 h-11 w-full rounded-xl bg-deem-red text-sm font-semibold text-white transition hover:bg-[#d64334] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {forgotLoading ? "Resetting..." : "Reset Password"}
              </button>
            </>
          )}

        </div>
      </div>
    )}
  </div>
);
};

export default Login;
