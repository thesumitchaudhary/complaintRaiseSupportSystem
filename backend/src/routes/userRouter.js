import express from "express";

import {
  createUser,
  getFilteredTicketDetails,
  getReassignedComplaints,
  loginUser,
  logoutUser,
  verifyEmail,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", createUser);
router.post("/verifyEmail", verifyEmail);
router.post("/login", loginUser);
router.get("/ticketDetails/filter", authMiddleware, getFilteredTicketDetails);
router.get("/logout", logoutUser);
router.get("/getReassignedComplaints", authMiddleware, getReassignedComplaints);

export default router
