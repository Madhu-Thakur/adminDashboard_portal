import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import logo from "../assets/images/logo-1.png";
import { AUTH_VERIFY_OTP_URL } from "../utils/api";

const VerifyOTP = () => {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const email = sessionStorage.getItem("resetEmail");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Reset session expired. Please try again.");
      navigate("/forgot-password");
      return;
    }

    if (!otp.trim()) {
toast.error("Please enter the OTP");
      return;
    }

    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(AUTH_VERIFY_OTP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,
          otp: otp.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
     toast.error(data.message || "Invalid OTP");
        return;
      }

      console.log("OTP verified successfully:", data);

      navigate("/reset-password");
    } catch (error) {
      console.error("Verify OTP Error:", error);
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
                Verify OTP
              </h1>

              <p className="mt-1.5 text-sm text-slate-500 sm:text-[15px]">
                Enter the 6-digit OTP sent to your email.
              </p>
            </div>
 
            <form onSubmit={handleSubmit} className="mt-7">
              <div>
                <div className="flex justify-center gap-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[index] || ""}
                      autoComplete="one-time-code"
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");

                        if (!value) return;

                        const newOtp = otp.split("");
                        newOtp[index] = value;

                        setOtp(newOtp.join(""));

                        if (index < 5) {
                          document.getElementById(`otp-${index + 1}`)?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !otp[index] && index > 0) {
                          document.getElementById(`otp-${index - 1}`)?.focus();
                        }
                      }}
                      className="h-12 w-12 rounded-xl border border-slate-300 bg-white text-center text-lg font-semibold text-deem-blue outline-none transition focus:border-deem-red focus:ring-4 focus:ring-[#EB5141]/10"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-5 flex h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-deem-red text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#d64334] active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-[#EB5141]/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{loading ? "Verifying..." : "Verify OTP"}</span>

                {!loading && <ArrowRight size={18} strokeWidth={2} />}
              </button>
            </form>

            {/* Back */}

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="inline-flex items-center gap-2 text-sm font-medium text-deem-blue transition hover:text-deem-red hover:underline"
              >
                <ArrowLeft size={15} strokeWidth={1.8} />
                Back to Forgot Password
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyOTP;
