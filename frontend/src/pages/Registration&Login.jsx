import { useState } from "react";
import { X, Loader2, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  forgotPasswordRequest,
  registerUser,
  userLogin,
  verifyEmail,
} from "../services/user";
import { toast } from "react-hot-toast";

const UserLogin = ({ closeUserLogin, theme }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [register, setRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmedPassword, setShowConfirmedPassword] = useState(false);
  const [showLoginPassowrd, setShowLoginPassword] = useState(false);

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register state
  const [name, setName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmedPassword, setRegConfirmedPassword] = useState("");
  const [OTP, setOTP] = useState("");

  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: userLogin,
    onSuccess: () => {
      toast.success("Login successful");
      navigate("/User/Dashboard");
    },
    onError: (err) => {
      setError(err.response?.data?.message || err.message || "Login failed");
      console.error("Login error", err);
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success("Register successful");
      setRegister(true);
      setOTP("");
      setTimeout(() => {
        toast.success("now verify your email code");
      }, 1000);
    },
    onError: (err) => {
      setError(
        err.response?.data?.message || err.message || "Registration failed",
      );
      toast.error("something wrong");
      console.error("Register error", err);
    },
  });

  const verifyMutation = useMutation({
    mutationFn: verifyEmail,
    onSuccess: () => {
      toast.success("Email verified successfully");
      setRegister(false);
      navigate("/userDashboard");
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
      setError(err.response?.data?.message || err.message || "Failed to send reset link");
      toast.error(err.response?.data?.message || "Failed to send reset link");
      console.error("Forgot password error", err);
    },
  });

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError(null);
    loginMutation.mutate({ email, password });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (register) {
      if (!OTP) {
        toast.error("Please enter the verification code");
        return;
      }

      verifyMutation.mutate({ code: OTP });
      return;
    }

    if (regPassword != regConfirmedPassword) {
      toast.error("Passwords do not match");
      return;
    }
    registerMutation.mutate({
      name,
      email: regEmail,
      password: regPassword,
      confirmedPassword: regConfirmedPassword,
    });
    setName("");
    setEmail("");
    setPassword("");
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-md">
      <div onClick={closeUserLogin} className="absolute inset-0" />

      <div className="relative w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-[0_25px_80px_rgba(15,23,42,0.28)] ring-1 ring-black/5 max-h-[88vh] h-[88vh]">
        <button
          onClick={closeUserLogin}
          className="absolute right-4 top-4 z-10 rounded-full bg-slate-900/80 p-2 text-white transition hover:bg-slate-900"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="grid lg:grid-cols-[0.95fr_1.05fr] h-full">
          <section className="flex flex-col justify-between bg-gradient-to-br from-blue-600 via-blue-700 to-sky-800 px-7 py-8 text-white sm:px-8 sm:py-10 lg:px-10 lg:py-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/75">
                {isLogin ? "USER LOGIN" : "USER REGISTER"}
              </p>
              <div className="mt-10 max-w-sm">
                <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                  Support System
                </h1>
                <p className="mt-4 text-sm leading-6 text-white/85 sm:text-base">
                  Keep your complaints, tickets, and customer responses in one
                  place with a clean login experience built for this project.
                </p>
              </div>
            </div>
          </section>

          <section className="flex flex-col bg-white px-6 py-7 sm:px-8 sm:py-8 lg:px-10 lg:py-9 h-full">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
                  {isLogin ? "Welcome back" : "Create your account"}
                </h2>
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="mt-5 flex-1 overflow-x-hidden">
              <div
                className="flex w-[200%] transition-transform duration-500 ease-in-out"
                style={{
                  transform: isLogin ? "translateX(0%)" : "translateX(-50%)",
                }}
              >
                <div className="w-1/2 pr-0 sm:pr-3">
                  <div className="rounded-[24px] border border-slate-200 bg-white px-1 py-1 shadow-sm sm:px-0 sm:py-0">
                    <form
                      onSubmit={handleLoginSubmit}
                      className="flex flex-col gap-3 px-3 pb-4 sm:px-5"
                    >
                      <div>
                        <label
                          htmlFor="email"
                          className="mb-2 block text-sm font-medium text-slate-700"
                        >
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter Your Email"
                          className="w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-0"
                          required
                        />
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <label
                            htmlFor="password"
                            className="block text-sm font-medium text-slate-700"
                          >
                            Password
                          </label>
                        </div>
                        <div className="flex">
                          <input
                            id="password"
                            type={showLoginPassowrd ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter Your Password"
                            className="w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-0"
                            required
                          />
                          {showLoginPassowrd ? (
                            <button
                              type="button"
                              className={`${theme ? "text-black" : "text-black"}`}
                              onClick={() => setShowLoginPassword(false)}
                            >
                              <Eye />
                            </button>
                          ) : (
                            <button
                              type="button"
                              className={`${theme ? "text-black" : "text-black"}`}
                              onClick={() => setShowLoginPassword(true)}
                            >
                              <EyeOff />
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          disabled={loading}
                          className="text-left text-xs text-blue-400 transition hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="mt-1 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading ? <Loader2 /> : "LOGIN"}
                      </button>

                      <p className="text-center text-sm text-slate-500">
                        Don&apos;t have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setIsLogin(false)}
                          className="font-semibold text-amber-500 transition hover:text-amber-600"
                        >
                          Sign up
                        </button>
                      </p>
                    </form>
                  </div>
                </div>

                <div className="w-1/2 pl-0 sm:pl-3">
                  <div className="rounded-[24px] border border-slate-200 bg-white px-1 py-1 shadow-sm sm:px-0 sm:py-0 max-h-[64vh] overflow-y-auto">
                    <form
                      onSubmit={handleRegisterSubmit}
                      className="flex flex-col gap-3 px-3 pb-4 sm:px-5"
                    >
                      <div>
                        <label
                          htmlFor="name"
                          className="mb-2 block text-sm font-medium text-slate-700"
                        >
                          Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter Your Name"
                          className="w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-0"
                          required
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="regEmail"
                          className="mb-2 block text-sm font-medium text-slate-700"
                        >
                          Email
                        </label>
                        <input
                          id="regEmail"
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="Enter Your Email"
                          className="w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-0"
                          required
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="regPassword"
                          className="mb-2 block text-sm font-medium text-slate-700"
                        >
                          Password
                        </label>
                        <div className="flex">
                          <input
                            id="regPassword"
                            type={showPassword ? "text" : "password"}
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="Create A Password"
                            className="w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-0"
                            required
                          />
                          {showPassword ? (
                            <button
                              type="button"
                              className={`${theme ? "text-black" : "text-black"}`}
                              onClick={() => setShowPassword(false)}
                            >
                              <Eye />
                            </button>
                          ) : (
                            <button
                              type="button"
                              className={`${theme ? "text-black" : "text-black"}`}
                              onClick={() => setShowPassword(true)}
                            >
                              <EyeOff />
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="regPassword"
                          className="mb-2 block text-sm font-medium text-slate-700"
                        >
                          Confimed Password
                        </label>
                        <div className="flex">
                          <input
                            id="regPassword"
                            type={showConfirmedPassword ? "text" : "password"}
                            value={regConfirmedPassword}
                            onChange={(e) =>
                              setRegConfirmedPassword(e.target.value)
                            }
                            placeholder="Confimed Password"
                            className="w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-0"
                            required
                          />
                          {showConfirmedPassword ? (
                            <button
                              type="button"
                              className={`${theme ? "text-black" : "text-black"}`}
                              onClick={() => setShowConfirmedPassword(false)}
                            >
                              <Eye />
                            </button>
                          ) : (
                            <button
                              type="button"
                              className={`${theme ? "text-black" : "text-black"}`}
                              onClick={() => setShowConfirmedPassword(true)}
                            >
                              <EyeOff />
                            </button>
                          )}
                        </div>
                      </div>
                      {register ? (
                        <div>
                          <label
                            htmlFor="regPassword"
                            className="mb-2 block text-sm font-medium text-slate-700"
                          >
                            OTP
                          </label>
                          <input
                            id="otp"
                            type="number"
                            value={OTP}
                            onChange={(e) => setOTP(e.target.value)}
                            placeholder="Enter otp"
                            className="w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-0"
                            required
                          />
                        </div>
                      ) : (
                        <p></p>
                      )}

                      {register ? (
                        <button
                          type="submit"
                          disabled={loading}
                          className="mt-1 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {loading ? "Please wait..." : "VERIFY CODE"}
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={loading}
                          className="mt-1 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {loading ? "Please wait..." : "REGISTER"}
                        </button>
                      )}

                      <p className="text-center text-sm text-slate-500">
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setIsLogin(true)}
                          className="font-semibold text-amber-500 transition hover:text-amber-600"
                        >
                          Login
                        </button>
                      </p>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
