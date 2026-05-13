import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

import adminModel from "./model/adminModel.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASS;
const JWT_SECRET = process.env.JWT_SECRET;

const adminSeed = async (req, res) => {
    try {
        if (!MONGO_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD || !JWT_SECRET) {
            throw new Error("Missing required env vars: MONGO_URI, ADMIN_EMAIL, ADMIN_PASS, JWT_SECRET");
        }

        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected");

        const existAdmin = await adminModel.findOne({ email: ADMIN_EMAIL });

        if (existAdmin) {
            console.log("Admin already exists");
            return;
        }

        const hashPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

        const createdAdmin = await adminModel.create({
            email: ADMIN_EMAIL,
            password: hashPassword,
        });

        console.log("Admin created:", createdAdmin.email);
    } catch (error) {
        console.error("Seed error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
}

adminSeed()