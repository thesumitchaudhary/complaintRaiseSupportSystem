import api from "../lib/api";

export const registerUser = async (payload = {}) => {
  const { name, email, password } = payload;

  if (!name || !email || !password) {
    const err = new Error("Missing required user fields: name, email, password");
    err.status = 400;
    throw err;
  }

  try {
    const response = await api.post("/user/create", {
      name,
      email,
      password
    })
    return response.data;
  } catch (error) {
    console.error("Register failed:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
}

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
  const { name, email, subject, message } = payload;

  if (!name || !email || !subject || !message) {
    const err = new Error("Missing required ticket fields: name, email, subject, message");
    err.status = 400;
    throw err;
  }

  try {
    const response = await api.post("/raiseTickets", {
      name,
      email,
      subject,
      message,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to Raise:", error.response?.status);
    throw error;
  }
};

export const getRaisedComplaint = async () => {
  try {
    const response = await api.get("/user/ticketDetails");
    return response.data;
  } catch (error) {
    console.log("Failed to fetch Raised Complaint Ticket: ", error.response?.status);
    throw error;
  }
}