import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import logo from "../assets/images/logo-1.png";
import { AUTH_FORGOT_PASSWORD_URL } from "../utils/api";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
    toast.error("Please enter your email address");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(AUTH_FORGOT_PASSWORD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
       toast.error(data.message || "Unable to send OTP");
        return;
      }

      console.log("OTP sent successfully:", data);
 
      sessionStorage.setItem("resetEmail", email.trim());

     toast.success("OTP sent successfully to your email");

      navigate("/verify-otp");
    } catch (error) {
      console.error("Forgot Password Error:", error);
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

      <main className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-6 sm:px-6">
        <div className="w-134.5 max-w-[calc(100vw-32px)]">
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
                Forgot Password?
              </h1>

              <p className="mt-1.5 text-sm text-slate-500 sm:text-[15px]">
                Enter your email to receive an OTP.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-7">
              <div>
                <label
                  htmlFor="forgot-email"
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
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email ID"
                    autoComplete="email"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-deem-blue outline-none transition placeholder:text-slate-400 focus:border-deem-red focus:ring-4 focus:ring-[#EB5141]/10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-5 flex h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-deem-red text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#d64334] active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-[#EB5141]/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{loading ? "Sending OTP..." : "Send OTP"}</span>

                {!loading && <ArrowRight size={18} strokeWidth={2} />}
              </button>
            </form>
 
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-sm font-medium text-deem-blue transition hover:text-deem-red hover:underline"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
