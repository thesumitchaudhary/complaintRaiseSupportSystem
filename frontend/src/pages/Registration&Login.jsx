import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Headphones,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  forgotPasswordRequest,
  registerUser,
  userLogin,
  verifyEmail,
} from "../services/user";

const FieldShell = ({ children, isDark }) => (
  <div
    className={`rounded-lg border px-3 py-2.5 transition focus-within:ring-2 ${
      isDark
        ? "border-slate-700 bg-slate-900/80 focus-within:border-cyan-400 focus-within:ring-cyan-400/20"
        : "border-slate-200 bg-white focus-within:border-cyan-500 focus-within:ring-cyan-500/15"
    }`}
  >
    {children}
  </div>
);

const UserLogin = ({ closeUserLogin, theme }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [register, setRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmedPassword, setShowConfirmedPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [name, setName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmedPassword, setRegConfirmedPassword] = useState("");
  const [OTP, setOTP] = useState("");

  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const isDark = Boolean(theme);

  const loginMutation = useMutation({
    mutationFn: userLogin,
    onSuccess: (data) => {
      resetLoginForm();

      const loggedInUser = data?.result || data?.admin || data;
      const loggedInRole = loggedInUser?.role || "user";
      localStorage.setItem("role", loggedInRole);

      if (loggedInRole === "admin") {
        navigate("/Admin/Dashboard");
      } else if (loggedInRole === "employee") {
        navigate("/Employee/AllTaskPage");
      } else {
        navigate("/User/Dashboard");
      }

      toast.success("Login successful");
    },
    onError: (err) => {
      setError(err.response?.data?.message || err.message || "Login failed");
      console.error("Login error", err);
    },
  });

  const resetLoginForm = () => {
    setEmail("");
    setPassword("");
  };

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success("Register successful");
      setRegister(true);
      setOTP("");
      setTimeout(() => {
        toast.success("Now verify your email code");
      }, 1000);
    },
    onError: (err) => {
      setError(
        err.response?.data?.message || err.message || "Registration failed",
      );
      toast.error("Something went wrong");
      console.error("Register error", err);
    },
  });

  const verifyMutation = useMutation({
    mutationFn: verifyEmail,
    onSuccess: () => {
      toast.success("Email verified successfully");
      setRegister(false);
      navigate("/User/Dashboard");
      setOTP("");
      setRegPassword("");
      setRegConfirmedPassword("");
    },
    onError: (err) => {
      setError(
        err.response?.data?.message || err.message || "Verification failed",
      );
      toast.error(err.response?.data?.message || "Verification failed");
      console.error("Verify error", err);
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPasswordRequest,
    onSuccess: () => {
      toast.success("Password reset link sent to your email");
    },
    onError: (err) => {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to send reset link",
      );
      toast.error(err.response?.data?.message || "Failed to send reset link");
      console.error("Forgot password error", err);
    },
  });

  const handleModeChange = (nextIsLogin) => {
    setError(null);
    setIsLogin(nextIsLogin);
  };

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    setError(null);
    loginMutation.mutate({ email, password });
  };

  const handleRegisterSubmit = (event) => {
    event.preventDefault();
    setError(null);

    if (register) {
      if (!OTP) {
        toast.error("Please enter the verification code");
        return;
      }

      verifyMutation.mutate({ code: OTP });
      return;
    }

    if (regPassword !== regConfirmedPassword) {
      toast.error("Passwords do not match");
      return;
    }

    registerMutation.mutate({
      name,
      email: regEmail,
      password: regPassword,
      confirmedPassword: regConfirmedPassword,
    });
  };

  const handleForgotPassword = () => {
    setError(null);

    if (!email) {
      toast.error("Please enter your email first");
      return;
    }

    forgotPasswordMutation.mutate({ email });
  };

  const loading =
    loginMutation.isPending ||
    registerMutation.isPending ||
    verifyMutation.isPending ||
    forgotPasswordMutation.isPending;

  const panelClass = isDark
    ? "border-slate-700 bg-slate-950 text-slate-100"
    : "border-white/80 bg-white text-slate-950";
  const mutedText = isDark ? "text-slate-400" : "text-slate-500";
  const labelText = isDark ? "text-slate-300" : "text-slate-700";
  const inputText = isDark
    ? "text-slate-100 placeholder:text-slate-500"
    : "text-slate-950 placeholder:text-slate-400";
  const iconText = isDark ? "text-cyan-300" : "text-cyan-700";

  const submitText = isLogin
    ? "Sign in"
    : register
      ? "Verify code"
      : "Create account";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-md sm:p-5">
      <button
        type="button"
        onClick={closeUserLogin}
        className="absolute inset-0 cursor-default"
        aria-label="Close login overlay"
      />

      <section
        className={`relative grid h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl border shadow-2xl lg:h-[86vh] lg:grid-cols-[0.9fr_1.1fr] ${panelClass}`}
      >
        <button
          type="button"
          onClick={closeUserLogin}
          className={`absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-lg border transition ${
            isDark
              ? "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
          }`}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <aside className="hidden min-h-0 flex-col justify-between overflow-hidden bg-slate-950 p-8 text-white lg:flex">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100">
              <Sparkles className="h-3.5 w-3.5" />
              Customer Access
            </div>

            <div className="mt-10 max-w-sm">
              <h1 className="text-4xl font-black leading-tight">
                Support System
              </h1>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                Sign in, verify your account, and keep every complaint moving
                through the right support workflow.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                icon: ShieldCheck,
                title: "Secure login",
                text: "Role-based routing for users, employees, and admins.",
              },
              {
                icon: Headphones,
                title: "Ticket ready",
                text: "Access complaint tracking as soon as you enter.",
              },
              {
                icon: CheckCircle2,
                title: "Email verification",
                text: "New accounts confirm ownership before dashboard access.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-white/10 bg-white/[0.06] p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="rounded-lg bg-cyan-400/15 p-2 text-cyan-200">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        {item.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <main
          className={`min-h-0 overflow-y-auto px-5 py-6 sm:px-8 lg:px-10 lg:py-9 ${
            isDark ? "bg-slate-950" : "bg-slate-50"
          }`}
        >
          <div className="mx-auto flex min-h-full max-w-md flex-col justify-center py-8">
            <div className="lg:hidden">
              <div className={`mb-6 inline-flex rounded-lg p-2 ${isDark ? "bg-slate-900" : "bg-white"}`}>
                <ShieldCheck className={`h-5 w-5 ${iconText}`} />
              </div>
            </div>

            <div>
              <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${iconText}`}>
                {isLogin ? "Welcome back" : register ? "Verify email" : "New account"}
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">
                {isLogin
                  ? "Sign in to your dashboard"
                  : register
                    ? "Enter your email code"
                    : "Create your customer account"}
              </h2>
              <p className={`mt-2 text-sm leading-6 ${mutedText}`}>
                {isLogin
                  ? "Use your registered email and password to continue."
                  : register
                    ? "We sent a verification code to your email address."
                    : "Register once, then verify your email before opening the dashboard."}
              </p>
            </div>

            <div
              className={`mt-6 grid grid-cols-2 rounded-xl border p-1 ${
                isDark
                  ? "border-slate-700 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <button
                type="button"
                onClick={() => handleModeChange(true)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isLogin
                    ? "bg-cyan-600 text-white shadow-sm"
                    : `${mutedText} hover:text-cyan-600`
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => handleModeChange(false)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  !isLogin
                    ? "bg-cyan-600 text-white shadow-sm"
                    : `${mutedText} hover:text-cyan-600`
                }`}
              >
                Register
              </button>
            </div>

            {error && (
              <div
                className={`mt-5 rounded-lg border px-4 py-3 text-sm ${
                  isDark
                    ? "border-rose-900/60 bg-rose-950/60 text-rose-100"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
                role="alert"
              >
                {error}
              </div>
            )}

            <form
              onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit}
              className="mt-6 space-y-4"
            >
              {!isLogin && !register && (
                <div>
                  <label htmlFor="name" className={`text-sm font-semibold ${labelText}`}>
                    Name
                  </label>
                  <FieldShell isDark={isDark}>
                    <div className="flex items-center gap-3">
                      <User className={`h-4 w-4 ${iconText}`} />
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Your full name"
                        className={`w-full bg-transparent text-sm outline-none ${inputText}`}
                        required
                      />
                    </div>
                  </FieldShell>
                </div>
              )}

              {isLogin ? (
                <div>
                  <label htmlFor="email" className={`text-sm font-semibold ${labelText}`}>
                    Email
                  </label>
                  <FieldShell isDark={isDark}>
                    <div className="flex items-center gap-3">
                      <Mail className={`h-4 w-4 ${iconText}`} />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        className={`w-full bg-transparent text-sm outline-none ${inputText}`}
                        required
                      />
                    </div>
                  </FieldShell>
                </div>
              ) : (
                !register && (
                  <div>
                    <label htmlFor="regEmail" className={`text-sm font-semibold ${labelText}`}>
                      Email
                    </label>
                    <FieldShell isDark={isDark}>
                      <div className="flex items-center gap-3">
                        <Mail className={`h-4 w-4 ${iconText}`} />
                        <input
                          id="regEmail"
                          type="email"
                          value={regEmail}
                          onChange={(event) => setRegEmail(event.target.value)}
                          placeholder="you@example.com"
                          className={`w-full bg-transparent text-sm outline-none ${inputText}`}
                          required
                        />
                      </div>
                    </FieldShell>
                  </div>
                )
              )}

              {isLogin && (
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="password" className={`text-sm font-semibold ${labelText}`}>
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={loading}
                      className="text-xs font-semibold text-cyan-600 transition hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <FieldShell isDark={isDark}>
                    <div className="flex items-center gap-3">
                      <Lock className={`h-4 w-4 ${iconText}`} />
                      <input
                        id="password"
                        type={showLoginPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter your password"
                        className={`w-full bg-transparent text-sm outline-none ${inputText}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((prev) => !prev)}
                        className={mutedText}
                        aria-label={showLoginPassword ? "Hide password" : "Show password"}
                      >
                        {showLoginPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FieldShell>
                </div>
              )}

              {!isLogin && !register && (
                <>
                  <div>
                    <label htmlFor="regPassword" className={`text-sm font-semibold ${labelText}`}>
                      Password
                    </label>
                    <FieldShell isDark={isDark}>
                      <div className="flex items-center gap-3">
                        <Lock className={`h-4 w-4 ${iconText}`} />
                        <input
                          id="regPassword"
                          type={showPassword ? "text" : "password"}
                          value={regPassword}
                          onChange={(event) => setRegPassword(event.target.value)}
                          placeholder="Create a password"
                          className={`w-full bg-transparent text-sm outline-none ${inputText}`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className={mutedText}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FieldShell>
                  </div>

                  <div>
                    <label
                      htmlFor="regConfirmedPassword"
                      className={`text-sm font-semibold ${labelText}`}
                    >
                      Confirm Password
                    </label>
                    <FieldShell isDark={isDark}>
                      <div className="flex items-center gap-3">
                        <Lock className={`h-4 w-4 ${iconText}`} />
                        <input
                          id="regConfirmedPassword"
                          type={showConfirmedPassword ? "text" : "password"}
                          value={regConfirmedPassword}
                          onChange={(event) =>
                            setRegConfirmedPassword(event.target.value)
                          }
                          placeholder="Confirm your password"
                          className={`w-full bg-transparent text-sm outline-none ${inputText}`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmedPassword((prev) => !prev)
                          }
                          className={mutedText}
                          aria-label={
                            showConfirmedPassword
                              ? "Hide confirmed password"
                              : "Show confirmed password"
                          }
                        >
                          {showConfirmedPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FieldShell>
                  </div>
                </>
              )}

              {!isLogin && register && (
                <div>
                  <label htmlFor="otp" className={`text-sm font-semibold ${labelText}`}>
                    Verification Code
                  </label>
                  <FieldShell isDark={isDark}>
                    <div className="flex items-center gap-3">
                      <ShieldCheck className={`h-4 w-4 ${iconText}`} />
                      <input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        value={OTP}
                        onChange={(event) => setOTP(event.target.value)}
                        placeholder="Enter email code"
                        className={`w-full bg-transparent text-sm outline-none ${inputText}`}
                        required
                      />
                    </div>
                  </FieldShell>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 text-sm font-bold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  <>
                    {submitText}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className={`mt-6 text-center text-sm ${mutedText}`}>
              {isLogin ? "Do not have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => handleModeChange(!isLogin)}
                className="font-bold text-cyan-600 transition hover:text-cyan-700"
              >
                {isLogin ? "Create one" : "Sign in"}
              </button>
            </p>
          </div>
        </main>
      </section>
    </div>
  );
};

export default UserLogin;
