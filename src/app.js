import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Use cors middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));


// routes import 
import userRouter from "./routes/user.route.js";

// routes declaration 
app.use("/user/api/v1/users", userRouter);

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));

app.use(cookieParser());

export { app }