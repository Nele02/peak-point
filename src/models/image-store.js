import * as cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.cloudinary_name,
  api_key: process.env.cloudinary_key,
  api_secret: process.env.cloudinary_secret,
});

export const imageStore = {
  async uploadImage(file) {
    const res = await cloudinary.v2.uploader.upload(file.path, {
      folder: "peak-point",
      resource_type: "image",
    });

    return {
      url: res.secure_url || res.url,
      publicId: res.public_id,
    };
  },

  async deleteImage(publicId) {
    if (!publicId) return;
    await cloudinary.v2.uploader.destroy(publicId, { resource_type: "image" });
  },
};
