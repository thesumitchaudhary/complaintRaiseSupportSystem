import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

import userModel from "./model/userModel.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASS;

const adminSeed = async (req, res) => {
    try {
        if (!MONGO_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
            throw new Error("Missing required env vars: MONGO_URI, ADMIN_EMAIL, ADMIN_PASS");
        }

        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected");

        const existAdmin = await userModel.findOne({ email: ADMIN_EMAIL });

        if (existAdmin) {
            console.log("Admin already exists");
            return;
        }

        const hashPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

        const createdAdmin = await userModel.create({
            name: "Super Admin",
            email: ADMIN_EMAIL,
            password: hashPassword,
            role: "admin",
            verified_at: new Date(),
        });

        console.log("Admin created:", createdAdmin.email);
    } catch (error) {
        console.error("Seed error:", error.message);
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
            console.log("MongoDB disconnected");
        }
    }
}

adminSeed()