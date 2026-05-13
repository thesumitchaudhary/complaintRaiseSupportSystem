import api from "../lib/api.js";

export const adminLogin = async ({ email, password }) => {
  try {
    const response = await api.post("/auth/login", {
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

export const adminLogout = async () => {
  try {
    const response = await api.get("/logout");
    return response.data;
  } catch (error) {
    console.error("Failed to logout:", error.response?.status);
    throw error;
  }
};

export const showComplain = async () => {
  try {
    const response = await api.get("/tickets");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch Complaints:", error.response?.status);
    throw error;
  }
}

export const updateComplaint = async (id, updatedData) => {
  try {
    const response = await api.put(`/tickets/${id}`, updatedData);

    return response.data;
  } catch (error) {
    console.error("Failed to update complaint:", error.response?.status);
    throw error;
  }
};

export const deleteComplaint = async (id) => {
  try {
    const response = await api.delete(`/tickets/${id}`);

    return response.data;
  } catch (error) {
    console.log("Failed to delete complaint:", error.response?.status);
    throw error;
  }
}