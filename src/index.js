// require('dotenv').config({ path: './env' });  // code readiability not good

import dotenv from "dotenv";
import connectDB from "./db/db.js";
import { app } from "./app.js";
dotenv.config({
    path: './.env'
});


connectDB()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(`⚙️  Server is running at Port: ${process.env.PORT}`);
        })
    })
    .catch((error) => {
        console.log("Mongo DB connection failed !!", error);
    })