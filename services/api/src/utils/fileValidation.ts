/**
 * Validates that a file is an image based on its MIME type
 * @param mimetype - The MIME type of the file
 * @returns true if the file is an image, false otherwise
 */
export const isImageFile = (mimetype: string | undefined): boolean => {
  return !!mimetype && mimetype.startsWith("image/");
};
