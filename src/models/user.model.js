import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema(
     {
          username: {
               type: String,
               required: true,
               unique: true,
               lowercase: true,
               trim: true,
               index: true
          },
          email: {
               type: String,
               required: true,
               unique: true,
               lowercase: true,
               trim: true
          },
          fullname: {
               type: String,
               required: true,
               trim: true,
               index: true
          },
          password: {
               type: String,
               required: [true, 'Password is required'],
               unique: true
          },
          avatar: {
               type: String,
               required: true
          },
          coverImage: {
               types: String
          },
          refreshToken: {
               types: String
          },
          watchHistory: [
               {
                    types: Schema.Types.ObjectId,
                    ref: "Video",
               }
          ]
     },
     { timestamps: true }
);

export const User = mongoose.model("User", userSchema);