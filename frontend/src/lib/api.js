import axios from "axios";

export const BACKEND_STATUS_EVENT = "backend-status-change";

let isBackendAvailable = true;

export const getBackendAvailability = () => isBackendAvailable;

export const reportBackendAvailability = (isAvailable) => {
  if (isBackendAvailable === isAvailable) {
    return;
  }

  isBackendAvailable = isAvailable;

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(BACKEND_STATUS_EVENT, {
        detail: { isAvailable },
      }),
    );
  }
};

const api = axios.create({
  baseURL: "http://localhost:2234/api",
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => {
    reportBackendAvailability(true);
    return response;
  },
  (error) => {
    const backendFailed =
      !error.response || Number(error.response?.status) >= 500;

    reportBackendAvailability(!backendFailed);
    return Promise.reject(error);
  },
);

export default api;
