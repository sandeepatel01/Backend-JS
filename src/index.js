// require('dotenv').config({ path: './env' });  // code readiability not good

import dotenv from "dotenv";
dotenv.config({
    path: './env'
});
import connectDB from "./db/db.js";



connectDB();