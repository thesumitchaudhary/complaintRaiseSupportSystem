import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import adminRouter from "./routes/adminRouter.js";
import index from "./routes/index.js";
import userRouter from "./routes/userRouter.js";
import employeeRoter from "./routes/employeeRouter.js"

dotenv.config();
const app = express();

const PORT = process.env.PORT;

const MONGO_URI = process.env.MONGO_URI;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.get("/", (req, res) => {
    res.json("hey this is woking")
})

app.get("/api/health", (req, res) => {
    const isDatabaseConnected = mongoose.connection.readyState === 1;

    if (!isDatabaseConnected) {
        return res.status(503).json({
            status: "error",
            message: "Backend is not working",
        });
    }

    return res.status(200).json({ status: "ok" });
});

app.use("/api/admin", adminRouter);
app.use("/api", index);
app.use("/api/user", userRouter);
app.use("/api/employee", employeeRoter);


const start = async () => {
    try {
        if (!MONGO_URI) {
            console.log(`hey the MONGO_URI is not set in env variable`)
            process.exit(1)
        } else {
            await mongoose.connect(MONGO_URI)
            console.log("mongodb is connected");
            const listenPort = PORT || 2234;
            app.listen(listenPort, () => {
                console.log(`hey the server is running on port ${listenPort}`)
            })
        }
    } catch (error) {
        console.error("MongoDB error:", error.message);
        process.exit(1);
    }
}

start()
