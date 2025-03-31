import { Request, Response } from "express";
import z from "zod";

import { createUser } from "@/models/userModel";
import {
  googleTokenVerifier,
  jwtTokenGenerator,
  jwtTokenRefresher,
} from "@/utils/authUtils";

import logger from "@/utils/logger";

const tokenReqBodySchema = z.object({
  token: z.string().min(1, "Oauth2 token is required."),
});

const googleUserSchema = z.object({
  sub: z.string().min(1, "Google ID is required."), // Probably never gonna throw but just in case
  name: z.string().min(1, "Name is required."),
  email: z.string().min(1, "Email is required.").email("Invalid email format."),
});

export const handleLoginByGoogleId = async (req: Request, res: Response) => {
  const validation = tokenReqBodySchema.safeParse(req.body);
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

    const { accessToken, refreshToken } = jwtTokenGenerator({
      userId: newUser.id,
      googleId: newUser.google_id,
    });

    return res
      .status(201)
      .json({ success: true, data: newUser, accessToken, refreshToken });
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

export const handleRefreshToken = async (req: Request, res: Response) => {
  const validation = tokenReqBodySchema.safeParse(req.body);
  if (!validation.success) {
    return res
      .status(400)
      .json({ success: false, errors: validation.error.errors });
  }

  try {
    const { accessToken, refreshToken } = await jwtTokenRefresher(
      validation.data.token
    );

    return res.status(200).json({ success: true, accessToken, refreshToken });
  } catch (error) {
    logger.error(error, "Error refreshing token.");

    if (error instanceof Error)
      return res.status(401).json({ success: false, message: error.message });
    else
      return res
        .status(500)
        .json({ success: false, message: "Internal server error." });
  }
};
