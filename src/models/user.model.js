import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

userSchema.pre("save", async function (next) {
     if (!this.isModified("password")) return next();

     this.password = await bcrypt.hash(this.password, 8)
     next();
});

userSchema.methods.isCorrectPassword = async function (password) {
     return await bcrypt.compare(password, this.password);
};


userSchema.methods.generateAccessToken = function () {
     return jwt.sign(
          {
               _id: this._id,
               email: this.email,
               fullname: this.fullname,
               usernmane: this.usernmane
          },
          process.env.ACCESS_TOKEN_SECRET,
          {
               expiresIn: process.env.ACCESS_TOKEN_EXPIRY
          }
     )
}


userSchema.methods.generateRefreshToken = function () {
     return jwt.sign(
          {
               _id: this._id,
               email: this.email,
               fullname: this.fullname,
               usernmane: this.usernmane
          },
          process.env.REFRESH_TOKEN_SECRET,
          {
               expiresIn: process.env.REFRESH_TOKEN_EXPIRY
          }
     )
}


export const User = mongoose.model("User", userSchema);