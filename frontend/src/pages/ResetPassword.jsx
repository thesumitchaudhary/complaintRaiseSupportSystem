import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../services/user";
import { toast } from "react-hot-toast";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: ({ email, token, newPassword }) =>
      resetPassword({ email, token, newPassword }),
    onSuccess: () => {
      toast.success(
        "Password has been reset. Please login with your new password.",
      );
      navigate("/");
    },
    onError: (err) => {
      setError(err.response?.data?.message || err.message || "Reset failed");
      toast.error(err.response?.data?.message || "Reset failed");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (!password || !confirm) {
      toast.error("Please enter and confirm your new password");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    mutation.mutate({ email, token, newPassword: password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Reset Password</h2>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-sm text-slate-700 mb-1">
              New password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">
              Confirm password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
          >
            Reset password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
