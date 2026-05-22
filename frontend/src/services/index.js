import api from "../lib/api.js";

export const showloggedinuser = async () => {
    try {
        const response = await api.get("/me");

        return response.data;
    }
    catch (error) {
        console.log("Failed to show logged in user:", error.response?.status)
        throw error;
    }
}