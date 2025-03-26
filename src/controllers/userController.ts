import { Request, Response } from "express";
import z from "zod";
import { Jwt } from "jsonwebtoken";

import { createUser, getUserByGoogleId, softDelUser } from "@/models/userModel";
import { googleTokenVerifier } from "@/utils/googleTokenVerifier";

import logger from "@/utils/logger";

const createGoogleUserSchema = z.object({
  token: z.string().min(1, "Oauth2 token is required."),
});

const googleUserSchema = z.object({
  sub: z.string().min(1, "Google ID is required."), // Probably never gonna throw but just in case
  name: z.string().min(1, "Name is required."),
  email: z.string().min(1, "Email is required.").email("Invalid email format."),
});

const getUserByGoogleIdSchema = z.object({
  googleId: z.string().min(1, "Google ID is required."),
});

const delUserSchema = z.object({
  id: z.string().uuid("Invalid user ID."),
});

export const handleCreateUserByGoogleId = async (
  req: Request,
  res: Response
) => {
  const validation = createGoogleUserSchema.safeParse(req.body);
  if (!validation.success)
    return res
      .status(400)
      .json({ success: false, errors: validation.error.errors });

  const googleUser = await googleTokenVerifier(validation.data.token);
  if (!googleUser)
    return res.status(401).json({ success: false, message: "Invalid token." });

  const validatedGoogleUser = googleUserSchema.safeParse(googleUser);
  if (!validatedGoogleUser.success)
    return res
      .status(400)
      .json({ success: false, errors: validatedGoogleUser.error.errors });

  try {
    const newUser = await createUser({
      googleId: validatedGoogleUser.data.sub,
      email: validatedGoogleUser.data.email,
      name: validatedGoogleUser.data.name,
    });

    // This code is not needed since we are using ON DUPLICATE KEY UPDATE
    // if (!newUser)
    //   return res
    //     .status(409)
    //     .json({ success: false, message: "User already exist." });

    return res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    logger.error(
      {
        error,
        googleId: validatedGoogleUser.data.sub,
        email: validatedGoogleUser.data.email,
      },
      "Error creating user."
    );

    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
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
