import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Loader2, RefreshCw, ServerOff } from "lucide-react";
import api, {
  BACKEND_STATUS_EVENT,
  getBackendAvailability,
  reportBackendAvailability,
} from "../lib/api";

const HEALTH_CHECK_INTERVAL = 15000;

const BackendStatusAlert = () => {
  const [isBackendAvailable, setIsBackendAvailable] = useState(
    getBackendAvailability,
  );
  const [isChecking, setIsChecking] = useState(false);

  const checkBackend = useCallback(async () => {
    try {
      await api.get("/health", { timeout: 5000 });
    } catch {
      // The Axios interceptor updates the global backend status.
    }
  }, []);

  const retryBackend = async () => {
    setIsChecking(true);
    await checkBackend();
    setIsChecking(false);
  };

  useEffect(() => {
    const handleBackendStatus = (event) => {
      setIsBackendAvailable(event.detail.isAvailable);
    };

    const handleOffline = () => {
      reportBackendAvailability(false);
    };

    window.addEventListener(BACKEND_STATUS_EVENT, handleBackendStatus);
    window.addEventListener("online", checkBackend);
    window.addEventListener("offline", handleOffline);

    checkBackend();
    const intervalId = window.setInterval(checkBackend, HEALTH_CHECK_INTERVAL);

    return () => {
      window.removeEventListener(BACKEND_STATUS_EVENT, handleBackendStatus);
      window.removeEventListener("online", checkBackend);
      window.removeEventListener("offline", handleOffline);
      window.clearInterval(intervalId);
    };
  }, [checkBackend]);

  if (isBackendAvailable) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-3 top-3 z-[100] flex justify-center sm:inset-x-6"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex w-full max-w-2xl items-start gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-red-950 shadow-2xl shadow-red-950/20">
        <span className="mt-0.5 rounded-lg bg-red-100 p-2 text-red-700">
          <ServerOff className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-700" />
            <p className="font-bold">Server is not working</p>
          </div>
          <p className="mt-1 text-sm leading-5 text-red-800">
            The server cannot be reached right now. Please start the backend or
            try again shortly.
          </p>
        </div>

        <button
          type="button"
          onClick={retryBackend}
          disabled={isChecking}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-100 disabled:cursor-wait disabled:opacity-60"
        >
          {isChecking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Retry</span>
        </button>
      </div>
    </div>
  );
};

export default BackendStatusAlert;
