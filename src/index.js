import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import { app } from "./app.js";

dotenv.config({
     path: './env'
});

connectDB()
     .then(() => {
          app.on("error", (error) => {
               console.log("Error: ", error);
               throw error
          });

          app.listen(process.env.PORT || 3000, () => {
               console.log(` ⚙️  Server is Running at port: ${process.env.PORT}`);
          });

     }).catch((error) => {
          console.log("MongoDB Connection FAILED!", error);
     })