import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import sanitize from "sanitize-filename";

const SIZE_LIMIT = 5; // In Megabyte
const UPLOAD_TEMP_DIR = process.env.UPLOAD_TEMP_DIR || "/tmp";

const memStorage = multer.memoryStorage();

const tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_TEMP_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const sanitizedName = sanitize(file.originalname);
    const extension = path.extname(sanitizedName);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});

function fileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) {
  // Only accepts .png, .jpg, .jpeg, .bmp, .gif files
  // Check MIME type too
  const allowedMimes = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/bmp",
    "image/gif",
  ];
  const fileTypes = /.png|.jpg|.jpeg|.bmp|.gif/;

  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeValid = allowedMimes.includes(file.mimetype);

  if (extName && mimeValid) {
    return cb(null, true);
  } else {
    cb(null, false);
  }
}

const sizeLimitByte = 1024 * 1024 * SIZE_LIMIT;

export const UploadToMem = multer({
  storage: memStorage,
  fileFilter: fileFilter,
  limits: { fileSize: sizeLimitByte },
});

export const UploadToTemp = multer({
  storage: tempStorage,
  fileFilter: fileFilter,
  limits: { fileSize: sizeLimitByte },
});
