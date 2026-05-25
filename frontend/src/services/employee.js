import api from "../lib/api.js";

export const createEmployee = async ({ name, email, password, confirmPassword }) => {
    try {
        const response = await api.post("/employee/create", {
            name,
            email,
            password,
            confirmPassword
        });
        return response.data;
    }
    catch (error) {
        console.log("Failed to create employee:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            isNetworkError: !error.response
        });
        throw error;
    }
}

export const adminLogin = async ({ email, password }) => {
    try {
        const response = await api.post("/employee/login", {
            email,
            password
        });
        return response.data;
    }
    catch (error) {
        console.error("Failed to create employee:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            isNetworkError: !error.response
        });
        throw error;
    }
}

export const employeeLogout = async () => {
    try {
        const response = await api.get("/employee/logout");
        return response.data;
    }
    catch (error) {
        console.error("Failed to logout:", error.response?.status);
        throw error
    }
}