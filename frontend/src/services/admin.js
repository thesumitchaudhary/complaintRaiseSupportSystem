import api from "../lib/api.js";

export const adminLogin = async ({ email, password }) => {
  try {
    const response = await api.post("/admin/login", {
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

// this is for show all registered user in admin dashboard

export const showUser = async () => {
  try {
    const response = await api.get("/admin/showUser");
    return response.data;
  } catch (error) {
    console.log("Failed to show user:", error.response?.status);
    throw error;
  }
}

export const showEmployee = async () => {
  try {
    const response = await api.get("/admin/showEmployee");
    return response.data;
  } catch (error) {
    console.log("Failed to show employee:", error.response?.status);
    throw error;
  }
}

export const assignTask = async ({ complaintId, employeeId, taskTitle, priority, dueDate, taskNotes }) => {
  try {
    const response = await api.post("/admin/assignTask", {
      complaintId,
      employeeId,
      taskTitle,
      priority,
      dueDate,
      taskNotes,
    })

    return response.data;
  } catch (error) {
    console.log("Failed to assignTask: ", error.response?.status);
    throw error;
  }
}

export const reassignTask = async ({ complaintId, newEmployeeId, taskTitle, priority, dueDate, taskNotes }) => {
  try {
    const response = await api.post("/admin/re-assignTasl", {
      complaintId,
      newEmployeeId,
      taskTitle,
      priority,
      dueDate,
      taskNotes
    })
  }
  catch (error) {
    console.log("Failed to ReassignTask: ")
  }
}