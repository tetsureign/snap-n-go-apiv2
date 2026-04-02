import sharp from "sharp";

const SUPPORTED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/tiff",
  "image/avif",
]);

/**
 * Validates that a file advertises a supported image MIME type.
 */
export const isImageFile = (mimetype: string | undefined): boolean => {
  return !!mimetype && SUPPORTED_IMAGE_MIME_TYPES.has(mimetype);
};

/**
 * Validates that the uploaded buffer can be parsed as an image.
 */
export const assertValidImageBuffer = async (
  buffer: Buffer,
): Promise<void> => {
  try {
    const metadata = await sharp(buffer).metadata();

    if (!metadata.format) {
      throw new Error("Unknown image format");
    }
  } catch {
    throw new Error("Uploaded file is not a valid image");
  }
};
