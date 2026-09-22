import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/logo-1.png";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#e2e6ea]">
 
      <div className="pointer-events-none absolute -left-28 -top-24 h-80 w-80 rounded-full border-[28px] border-[#EB5141]/10 sm:h-96 sm:w-96" />
 
      <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full border-[28px] border-[#144667]/10 sm:h-96 sm:w-96" />
 
      <div className="pointer-events-none absolute -bottom-32 -left-28 h-80 w-80 rounded-full border-[28px] border-[#144667]/10 sm:h-96 sm:w-96" />
 
      <div className="pointer-events-none absolute -bottom-40 -right-28 h-96 w-96 rounded-full bg-[#144667]/[0.045] sm:h-[430px] sm:w-[430px]" />
 
      <div className="pointer-events-none absolute right-[12%] top-[46%] h-24 w-24 rounded-full bg-[#EB5141]/[0.07] sm:h-28 sm:w-28" />
 
      <div className="pointer-events-none absolute left-[14%] top-[22%] h-16 w-16 rounded-full bg-[#144667]/[0.04]" />

      <main className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-6 sm:px-6">
 
        <div className="w-full max-w-[500px]">

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
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-deem-blue outline-none transition placeholder:text-slate-400 focus:border-[#EB5141] focus:ring-4 focus:ring-[#EB5141]/10"
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
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-deem-blue outline-none transition placeholder:text-slate-400 focus:border-[#EB5141] focus:ring-4 focus:ring-[#EB5141]/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
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
                    onChange={(e) =>
                      setRememberMe(e.target.checked)
                    }
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

                <ArrowRight
                  size={18}
                  strokeWidth={2}
                />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;