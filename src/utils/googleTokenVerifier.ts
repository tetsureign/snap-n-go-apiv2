import { OAuth2Client } from "google-auth-library";

import logger from "@/utils/logger";

const oauth2client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function googleTokenVerifier(idToken: string) {
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
}
