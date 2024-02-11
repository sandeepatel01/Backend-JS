import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        username: {
            type: String,
            required: true,
            trim: true,
            index: true,
            unique: true,
            lowercase: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            index: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        watchHistory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        },
        avatar: {
            type: String,
            required: true
        },
        coverImage: {
            type: String
        }
    },
    { timestamps: true }
)

export const User = mongoose.model("User", userSchema);