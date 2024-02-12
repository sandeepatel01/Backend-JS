import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        // When local file path not availible
        if (!localFilePath) return null
        // upload file on cloudinary 
        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" })
        // file has been uploaded successfull 
        // console.log("file is uploaded on cloudinary", response)
        // console.log("file is uploaded on cloudinary", response.url);
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        // remove the locally saved temparary file as the upload operation got failed
        fs.unlinkSync(localFilePath)
        return null
    }
}
export { uploadOnCloudinary };