import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { adminLogin } from "../services/admin";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const AdminLogin = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: adminLogin,
    onSuccess: () => {
      toast.success("login successfull");
      navigate("/dashboard");
    },
    onError: (error) => {
      console.log("Error", error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate({
      email,
      password,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/20 backdrop-blur-sm">
      <div onClick={onClose} className="absolute inset-0" />

      <div className="relative w-full max-w-sm mx-4 overflow-hidden rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 sm:px-6">
          <h2 className="text-xl font-bold sm:text-2xl text-black">
            Admin Login
          </h2>
          <button
            onClick={onClose}
            className="rounded-full text-black p-1 transition-colors hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-sky-800 px-6 py-7 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/75">
            Admin access
          </p>
          <div className="mt-8">
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Support System
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/85 sm:text-base">
              Sign in to manage complaints, tickets, and support activity.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 px-4 py-5 text-black sm:px-6"
        >
          <div className="flex flex-col">
            <label htmlFor="email" className="mb-2 text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="mb-2 text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
