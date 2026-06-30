import express from "express";

import {
    deleteTicket,
    getCurrentUser,
    getTickets,
    handleForgotPassword,
    logout,
    raiseTicket,
    resetPassword,
    updateTicket,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizedRoles } from "../middleware/authorizedRoles.js";

const router = express.Router();

router.post("/raiseTickets", authMiddleware, raiseTicket);
router.route("/forgotPassword").get(handleForgotPassword).post(handleForgotPassword);
router.get("/me", authMiddleware, authorizedRoles("user", "admin", "employee"), getCurrentUser);
router.post("/resetPassword", resetPassword);
router.get("/tickets", getTickets);
router.put("/tickets/:id", authMiddleware, updateTicket);
router.delete("/tickets/:id", authMiddleware, deleteTicket);
router.get("/logout", logout);

export default router
