import { Request, Response } from "express";
import z from "zod";

import { createUser } from "@/models/userModel";
import { googleTokenVerifier, jwtTokenGenerator } from "@/utils/authUtils";

import logger from "@/utils/logger";

const googleLoginReqBodySchema = z.object({
  token: z.string().min(1, "Oauth2 token is required."),
});

const googleUserSchema = z.object({
  sub: z.string().min(1, "Google ID is required."), // Probably never gonna throw but just in case
  name: z.string().min(1, "Name is required."),
  email: z.string().min(1, "Email is required.").email("Invalid email format."),
});

export const handleLoginByGoogleId = async (req: Request, res: Response) => {
  const validation = googleLoginReqBodySchema.safeParse(req.body);
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
      googleId: validatedGoogleUser.data.sub,
      email: validatedGoogleUser.data.email,
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

export const handleRefreshToken = (req: Request, res: Response) => {};
