import { Request, Response } from "express";
import z from "zod";

import { createUser, getUserByGoogleId } from "@/models/userModel";

import logger from "@/utils/logger";

const createUserSchema = z.object({
  googleId: z.string().min(1, "Google ID is required."),
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email format"),
});

export const handleCreateUser = async (req: Request, res: Response) => {
  try {
    const validatedData = createUserSchema.parse(req.body);

    const newUser = await createUser(validatedData);
    return res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res.status(400).json({ success: false, errors: error.errors });

    logger.error({ err: error }, "Error creating user.");
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const handleGetUserByGoogleId = async (req: Request, res: Response) => {
  const { googleId } = req.params;

  try {
    const user = await getUserByGoogleId(googleId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    return res.json({ success: true, data: user });
  } catch (error) {
    logger.error({ err: error, googleId }, "Error fetching user");
    return res.status(500).json({ success: false, message: error });
  }
};
