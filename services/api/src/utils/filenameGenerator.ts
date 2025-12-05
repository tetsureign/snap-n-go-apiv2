import path from "path";
import crypto from "crypto";

/**
 * Generates a unique filename using timestamp, random string, and file extension
 * @param originalFilename - The original filename to extract extension from
 * @returns A unique filename in format: timestamp-randomstring.ext
 */
export const generateUniqueFilename = (originalFilename: string): string => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString("hex");
  const fileExtension = path.extname(originalFilename) || ".tmp";
  return `${timestamp}-${randomString}${fileExtension}`;
};

