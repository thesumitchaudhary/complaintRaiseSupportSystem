import express from "express";
import complaints from "../model/complaints.js";

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

router.get("/complaint-history", authMiddleware, async (req, res) => {
  try {
    const id = req.user.id;

    const complaintHistory = await complaints.find({ customerId: id });

    if (complaintHistory.length === 0) {
      return res.status(404).json({
        success: false,
        message: "there is no complaint",
      });
    }

    return res.status(200).json({
      success: true,
      result: complaintHistory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

export default router
