import express from "express";

import {
    assignTask,
    loginAdmin,
    reassignTask,
    showEmployees,
    showUsers,
} from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizedRoles } from "../middleware/authorizedRoles.js"

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/showUser", showUsers);
router.get("/showEmployee", showEmployees);
router.post("/assignTask", authMiddleware, authorizedRoles("admin"), assignTask);
router.post("/reassignTask", authMiddleware, authorizedRoles("admin"), reassignTask);

export default router
