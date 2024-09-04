import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";

const memStorage = multer.memoryStorage();
const tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/tmp");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

function fileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) {
  // Only accepts .png, .jpg, .jpeg files
  const fileTypes = /.png|.jpg|.jpeg/;
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  if (extName) {
    return cb(null, true);
  } else {
    cb(null, false);
  }
}

export const UploadToMem = multer({
  storage: memStorage,
  fileFilter: fileFilter,
  // Limits the max file size to 15MB
  limits: { fileSize: 1024 * 1024 * 15 },
});

export const UploadToTemp = multer({
  storage: tempStorage,
  fileFilter: fileFilter,
  // Limits the max file size to 15MB
  // TODO: Make this dynamic
  limits: { fileSize: 1024 * 1024 * 15 },
});
