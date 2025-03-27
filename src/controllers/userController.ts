import { Request, Response } from "express";
import z from "zod";

import { getUserByGoogleId, softDelUser } from "@/models/userModel";

import logger from "@/utils/logger";

const getUserByGoogleIdSchema = z.object({
  googleId: z.string().min(1, "Google ID is required."),
});

const delUserSchema = z.object({
  id: z.string().uuid("Invalid user ID."),
});

export const handleGetUserByGoogleId = async (req: Request, res: Response) => {
  const validation = getUserByGoogleIdSchema.safeParse(req.params);
  if (!validation.success)
    return res
      .status(400)
      .json({ success: false, errors: validation.error.errors });

  try {
    const user = await getUserByGoogleId(validation.data.googleId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    return res.json({ success: true, data: user });
  } catch (error) {
    logger.error(error, "Error fetching user.");

    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

export const handleSoftDelUser = async (req: Request, res: Response) => {
  const validation = delUserSchema.safeParse(req.params);
  if (!validation.success)
    return res
      .status(400)
      .json({ success: false, errors: validation.error.errors });

  try {
    const result = await softDelUser(validation.data.id);

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    return res.json({ success: true });
  } catch (error) {
    logger.error(error, "Error deleting user.");

    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
