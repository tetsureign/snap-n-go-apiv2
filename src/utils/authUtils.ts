import { OAuth2Client } from "google-auth-library";
import * as jwt from "jsonwebtoken";

import { getUserByGoogleId } from "@/models/userModel";
import { TokenSchema } from "@/types";

import logger from "@/utils/logger";

const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;
const ACCESS_TOKEN_EXPIRY = "1h";
const REFRESH_TOKEN_EXPIRY = "30d";

const oauth2client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleTokenVerifier = async (idToken: string) => {
  try {
    const ticket = await oauth2client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    return ticket.getPayload();
  } catch (error) {
    logger.error(error, "Error verifying Google token.");
    return null;
  }
};

export const jwtTokenGenerator = (payload: TokenSchema) => ({
  accessToken: jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  }),
  refreshToken: jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  }),
});

export const jwtTokenRefresher = async (token: string) => {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as TokenSchema;
    const user = await getUserByGoogleId(decoded.googleId);
    // Code 401
    if (!user) throw new Error("Invalid token.");

    const { accessToken, refreshToken } = jwtTokenGenerator({
      userId: user.id,
      googleId: user.google_id,
    });

    return { accessToken, refreshToken };
  } catch {
    // Code 401
    throw new Error("Session expired, log in again.");
  }
};
