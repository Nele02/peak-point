import * as cloudinary from "cloudinary";
import dotenv from "dotenv";
import fs from "fs/promises";

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.cloudinary_name,
  api_key: process.env.cloudinary_key,
  api_secret: process.env.cloudinary_secret,
});

export const imageStore = {
  async uploadImage(file) {
    if (!file) return null;

    const {path} = file;
    if (!path) return null;

    try {
      const stat = await fs.stat(path);
      if (!stat || stat.size === 0) return null;
    } catch {
      return null;
    }

    try {
      const res = await cloudinary.v2.uploader.upload(path, {
        folder: "peak-point",
        resource_type: "image",
      });

      return {
        url: res.secure_url || res.url,
        publicId: res.public_id,
      };
    } catch (e) {
      if (e?.http_code === 400 && String(e?.message || "").toLowerCase().includes("empty")) {
        return null;
      }
      throw e;
    }
  },

  async deleteImage(publicId) {
    if (!publicId) return;
    await cloudinary.v2.uploader.destroy(publicId, { resource_type: "image" });
  },
};
