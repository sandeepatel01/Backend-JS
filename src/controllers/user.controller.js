import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";



// create function for token generate 
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(
            500,
            error.massage,
            "Something went wrong while generating referesh and access token"
        )
    }
};


// ********** User Register controller ************
const registerUser = asyncHandler(async (req, res) => {
    // 1. Get User details from frontend 
    const { fullname, username, email, password } = req.body;

    // **** Testing ***** 
    // console.log("fullname", fullname);
    // console.log("email", email);
    // console.log("password", password);


    // 2. Data Validation 
    if (
        [fullname, username, email, password].some((field) => {
            return field?.trim() === ""
        })
    ) {
        throw new ApiError(400, "All fields are required");
    }


    // 3. Check if user already exists 
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    // console.log("exists user: ", existedUser);
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // console.log(req.files);

    // 4. Check for avatar & coverImage
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // console.log("Avatar Image local path: ", avatarLocalPath);

    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // console.log("Cover Image local path", coverImageLocalPath);

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }


    // 5. Upload then to cloudinary [avatar, coverImage]
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    // console.log("Avatar url: ", avatar);

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    // console.log("coverImage url: ", coverImage);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required !!");
    }

    // 6. Create user Object [create entry in db] 
    const user = await User.create(
        {
            fullname,
            username: username.toLowerCase(),
            email,
            password,
            avatar: avatar.url,
            coverImage: coverImage?.url || ""
        }
    )

    // console.log("User:", user);

    // 7. Find created user & Remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    // 8. Check for User creation 
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user");
    }



    // 9. Return Response 
    return res.status(200).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

});

// ***** User Login controller **************
const loginUser = asyncHandler(async (req, res) => {

    // 1. fetch data from request body 
    const { username, email, password } = req.body;

    // 2. Validation check username or email
    if (!(username || email)) {
        throw new ApiError(400, "username or email field is required");
    };

    // 3. find the user 
    const user = User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    // 4. check Password  validation
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credential")
    }

    // 5. Generate access Token Refresh Token 
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // 6. Sent Token in cookie 
    const option = {
        httpOnly: true,
        secure: true
    };

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    // console.log("loged In user: ", loggedInUser);

    // 7. Return Response 
    return res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "user LogedIn successfully"
            )
        )

});

// ******** User logout controller ************ 
const logoutUser = asyncHandler(async (req, res) => {

    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        { new: true }

    )

    const option = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", option)
        .ciearCookie("refreshToken", option)
        .json(
            new ApiResponse(200, {}, "User Logged Out!!!!")
        )

});

// ************* Refresh Access Token cotroller ************* 
const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookie.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "UnAuthorized Request!")
    };

    // Verify the incomingRefreshToken 
    const decodedToken = jwt.verify(incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET)


    // Find User 
    const user = User.findById(decodedToken?._id);
    if (!user) {
        throw new ApiError(401, "Invalid Refresh Token!")
    };

    // Check Validation Refresh Token 
    if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh Token is Expired OR used")
    };

    // Generate new Token 
    const option = {
        httpOnly: true,
        secure: true
    }

    const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id);

    // Return Response 
    return res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", newRefreshToken, option)
        .json(
            200,
            {
                accessToken, refreshToken: newRefreshToken
            },
            "Access Token refreshed "
        )
});

// ************** Update Current Password controoler ******************
const udatePassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPasswprd } = req.body

    // Find User 
    const user = await User.findById(user?._id);

    // Check Password Validation 
    const isPasswordCorrect = user.isPassword(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Old Password");
    }

    user.password = newPasswprd
    await user.save({ validateBeforeSave: false });

    // return response 
    return res
        .status(200)
        .json(
            new ApiResponse(
                200, {}, "Password Update SuccessFully"
            )
        )

});

// **************** Get Current User Controller 
const getCurrentUser = asyncHandler(async (req, res) => {

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "Current User Fetched SuccessFully"
            )
        )

});

// ******************* Upate User  Account Details  Controller ************** 
const updateAccountDetails = asyncHandler(async (req, res) => {

    // Access User Information (Data) 
    const { fullname, email, username } = req.body;

    // Validate 
    if (!fullname && !email && !username) {
        throw new ApiError(400, "All fields are Required!")
    };

    // Find User  && Update Details
    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname: fullname,
                email: email,
                username: username
            }
        },
        { new: true }
    ).select("-password");

    // Return Response 
    return res
        .status(200)
        .json(
            new ApiResponse(
                200, user, "Account details update successfull"
            )
        );

});

// ************ Update User Avatar Controller 
const updateUserAvatar = asyncHandler(async (req, res) => {

    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing!")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
    };

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.ulr
            }
        },
        { new: true }
    ).select("-password");

    // Return Response 
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "User avatar is update successfully"
            )
        )

});

// ************* Get User Channel Profile Controller *************
const getUserChannelProfile = asyncHandler(async (req, res) => {

    const { username } = req.params;
    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    };

    // find the channel subscriber 
    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel"
            }
        }
    ])

})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    udatePassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar
};