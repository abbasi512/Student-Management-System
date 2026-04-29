import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import { cloudinary } from "../config/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "sms/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
  } as Record<string, unknown>,
});

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});
