import api from "../lib/api";

export const registerUser = async (payload = {}) => {
  const { name, email, password, confirmedPassword } = payload;

  if (!name || !email || !password || !confirmedPassword) {
    const err = new Error(
      "Missing required user fields: name, email, password, confirmedPassword",
    );
    err.status = 400;
    throw err;
  }

  try {
    const response = await api.post("/user/create", {
      name,
      email,
      password,
      confirmedPassword,
    });
    return response.data;
  } catch (error) {
    console.error("Register failed:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const verifyEmail = async ({ code } = {}) => {
  if (!code) {
    const err = new Error("Verification code is required");
    err.status = 400;
    throw err;
  }

  try {
    const response = await api.post("/user/verifyEmail", { code });
    return response.data;
  } catch (error) {
    console.error("Email verification failed:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const userLogin = async ({ email, password }) => {
  try {
    const response = await api.post("/user/login", {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    console.error("Login failed:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      isNetworkError: !error.response,
    });
    throw error;
  }
};

export const forgotPasswordRequest = async ({ email } = {}) => {
  if (!email) {
    const err = new Error("Email is required");
    err.status = 400;
    throw err;
  }

  try {
    const response = await api.post("/forgotPassword", { email });
    return response.data;
  } catch (error) {
    console.error("Forgot password request failed:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const resetPassword = async ({ email, token, newPassword } = {}) => {
  if (!email || !token || !newPassword) {
    const err = new Error("email, token and newPassword are required");
    err.status = 400;
    throw err;
  }

  try {
    const response = await api.post("/resetPassword", {
      email,
      token,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error("Reset password failed:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const userLogout = async () => {
  try {
    const response = await api.get("/user/logout");
    return response.data;
  } catch (error) {
    console.error("Failed to logout:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const createTicket = async (payload = {}) => {
  const { name, email, subject, message, serviceType } = payload;

  if (!name || !email || !subject || !message || !serviceType) {
    const err = new Error(
      "Missing required ticket fields: name, email, subject, message, serviceType",
    );
    err.status = 400;
    throw err;
  }

  try {
    const response = await api.post("/raiseTickets", {
      name,
      email,
      subject,
      message,
      serviceType,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to Raise:", error.response?.status);
    throw error;
  }
};

export const getRaisedComplaint = async (filters = {}) => {
  const normalizedFilters =
    typeof filters === "string" ? { search: filters } : filters;

  const params =
    normalizedFilters && typeof normalizedFilters === "object"
      ? {
          ...(normalizedFilters.startDate
            ? { startDate: normalizedFilters.startDate }
            : {}),
          ...(normalizedFilters.endDate
            ? { endDate: normalizedFilters.endDate }
            : {}),
          ...(normalizedFilters.search
            ? { search: normalizedFilters.search }
            : {}),
          ...(normalizedFilters.page ? { page: normalizedFilters.page } : {}),
          ...(normalizedFilters.limit
            ? { limit: normalizedFilters.limit }
            : {}),
        }
      : {};

  try {
    const response = await api.get("/user/ticketDetails/filter", { params });
    return response.data;
  } catch (error) {
    console.log(
      "Failed to fetch Raised Complaint Ticket: ",
      error.response?.status,
    );
    throw error;
  }
};
