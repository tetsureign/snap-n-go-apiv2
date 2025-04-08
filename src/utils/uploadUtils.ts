import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";

const SIZE_LIMIT = 5; // In Megabyte

const memStorage = multer.memoryStorage();

const tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/tmp");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});

function fileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) {
  // Only accepts .png, .jpg, .jpeg, .bmp, .gif files
  const fileTypes = /.png|.jpg|.jpeg|.bmp|.gif/;
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  if (extName) {
    return cb(null, true);
  } else {
    cb(null, false);
  }
}

const sizeLimitInByte = 1024 * 1024 * SIZE_LIMIT;

export const UploadToMem = multer({
  storage: memStorage,
  fileFilter: fileFilter,
  // Only accepts <= 5MB
  limits: { fileSize: sizeLimitInByte },
});

export const UploadToTemp = multer({
  storage: tempStorage,
  fileFilter: fileFilter,
  // Only accepts <= 5MB
  limits: { fileSize: sizeLimitInByte },
});
