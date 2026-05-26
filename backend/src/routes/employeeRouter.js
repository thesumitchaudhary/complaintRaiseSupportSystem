import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import userModel from "../model/userModel.js";

dotenv.config();

const router = express.Router();

router.get("/", (req, res) => {
    res.send("hey it's working right now");
})

router.post("/create", async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        if (!name || !email || !password || !confirmPassword) {
            return res.status(401).json({ success: false, message: "hey name, email,password and confirmPassword is mandatory" });
        }

        if (password != confirmPassword) {
            return res.status(401).json({ message: false, message: "passowrd is not match" })
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const employee = await userModel.create({
            name,
            email,
            role: "employee",
            password: hash
        })

        const token = jwt.sign({ name: employee.name, email: employee.email, role: employee.role }, process.env.JWT_SECRET);

        res.cookie("token", token);

        res.status(200).json({ success: true, message: "hey employee create successfully", result: employee });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal server Error", error: error.message });
    }
})

router.post("/login", async (req, res) => {
    try {
        const { email, passowrd } = req.body;

        if (!email || !passowrd) {
            return res.status(401).json({ success: false, message: "hey email and password is mandatory" });
        }

        const employee = await userModel.findOne({ email });

        if (!employee) {
            return res.status(401).json({ success: false, message: "employee is not exist" });
        }

        const isMatch = await bcrypt.compare(passowrd, employee.passowrd);


    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal servver Error", error: error.message });
    }
})

router.get("/logout", (req, res) => {
    try {
        res.cookie("token", "");

        res.status(200).json({ success: true, message: "logout is successfully" })
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal servver Error", error: error.message });
    }
})



export default router;