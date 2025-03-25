import { Request, Response } from "express";
import z from "zod";
import { JWT, OAuth2Client } from "google-auth-library";

import { createUser, getUserByGoogleId } from "@/models/userModel";

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

const oauth2client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(idToken: string) {
  const ticket = await oauth2client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  return ticket.getPayload();
}

export const handleCreateUserByGoogleId = async (
  req: Request,
  res: Response
) => {
  const validation = createGoogleUserSchema.safeParse(req.body);
  if (!validation.success)
    return res
      .status(400)
      .json({ success: false, errors: validation.error.errors });

  const googleUser = await verifyGoogleToken(validation.data.token);
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

    if (!newUser)
      return res
        .status(409)
        .json({ success: false, message: "User already exist." });

    return res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    logger.error(error, "Error creating user.");

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
    logger.error(error, "Error fetching user");

    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
