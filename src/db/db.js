import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\n MongoDB Connecte Successfully!! DB Host ${connectionInstance.connection.host}`)
        // console.log("connection Instance:", connectionInstance);
    } catch (error) {
        console.log("MongnoDB Connection FAIL", error);
        process.exit(1);
    }
}

export default connectDB;