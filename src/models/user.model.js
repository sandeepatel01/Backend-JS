import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

// before data saving in db encrypted the password using pre hook 
userSchema.pre("save", async function (next) {
    // when modifiecation add in password field only  
    if (!this.isModified("password")) return next()
    // when password [all fields] saving in db  then catch the password field, encrypt & saved
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

// password Compare [user Password, encrypte password ] 
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

// JWT token 

// generate Access Token 
userSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullname: this.fullname,
            username: this.username
        },
        process.env.ACCES_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCES_TOKEN_EXPIRY
        }

    )
}

// generate Refresh Token 
userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullname: this.fullname,
            username: this.username
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }

    )
}


export const User = mongoose.model("User", userSchema);