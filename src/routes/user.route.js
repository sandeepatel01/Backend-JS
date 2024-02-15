import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser
} from "../controllers/user.controller.js";


const router = Router();

router.route("/register").post(
    // middleware inject 
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ])
    , registerUser);

router.route("/login").post(loginUser);


// Secured Routes 
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken)

export default router;