import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";


export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header;

    if (!token) {
        throw new ApiError(401, "UnAuthorized request")
    }

    const decodedToken = jwt.verify(token, process.env.ACCES_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
        "-password -refreshToken"
    );
    if (!user) {
        throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user
    next()

})
