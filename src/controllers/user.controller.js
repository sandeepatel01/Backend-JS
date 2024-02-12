import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";

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

    console.log(req.files);

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

})



export { registerUser };