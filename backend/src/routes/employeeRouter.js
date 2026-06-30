import express from "express";

import {
    addWorkUpdate,
    createEmployee,
    employeeHome,
    getAssignedComplaints,
    loginEmployee,
    logoutEmployee,
} from "../controllers/employeeController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizedRoles } from "../middleware/authorizedRoles.js";

const router = express.Router();

router.get("/", employeeHome);
router.post("/create", createEmployee);
router.post("/login", loginEmployee);
router.get("/logout", logoutEmployee);

router.get("/showAssignedComplaint", authMiddleware, authorizedRoles("employee"), getAssignedComplaints);
router.get("/complaints", authMiddleware, authorizedRoles("employee"), getAssignedComplaints);
router.post("/complaints/:complaintId/work-updates", authMiddleware, authorizedRoles("employee"), addWorkUpdate);

export default router;
