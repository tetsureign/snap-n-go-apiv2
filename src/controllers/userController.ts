import { Request, Response } from "express";
import z from "zod";

import { createUser, getUserByGoogleId } from "@/models/userModel";

import logger from "@/utils/logger";

const createUserSchema = z.object({
  googleId: z.string().min(1, "Google ID is required."),
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email format"),
});

const getUserByGoogleIdSchema = z.object({
  googleId: z.string().min(1, "Google ID is required."),
});

// This only saves data for now. TODO: Add proper Google login.
export const handleCreateUser = async (req: Request, res: Response) => {
  const validation = createUserSchema.safeParse(req.body);
  if (!validation.success)
    return res
      .status(400)
      .json({ success: false, errors: validation.error.errors });

  try {
    const newUser = await createUser(validation.data);

    return res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    logger.error(error, "Error creating user.");
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

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
    logger.error(error, "Error fetching user");

    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
