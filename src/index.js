// require('dotenv').config({ path: './env' });  // code readiability not good

import dotenv from "dotenv";
dotenv.config({
    path: './env'
});
import connectDB from "./db/db.js";



connectDB()
    .then(() => {
        app.listrn(process.env.PORT || 3000, () => {
            console.log(`Server is running at Port: ${process.env.PORT}`);
        })
    })
    .catch((error) => {
        console.log("Mongo DB connection failed !!", error);
    })