import mongoose from "mongoose";
import { DB_NAME } from "./constants";
import dotenv from "dotenv";
import connectDB from "./db/db";

dotenv.config({
     path: './env'
});

connectDB()