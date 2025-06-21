import { createOrUpdateUser } from "@/services/userService";
import {
  googleTokenVerifier,
  jwtTokenGenerator,
  jwtTokenRefresher,
} from "@/utils/authUtils";

export async function loginWithGoogleToken(token: string) {
  const googleUser = await googleTokenVerifier(token);
  if (!googleUser) throw new Error("Invalid Google token.");

  const { sub: googleId, email, name } = googleUser;
  if (!googleId || !email || !name)
    throw new Error("Missing Google user info.");

  const user = await createOrUpdateUser({ googleId, email, name });
  const { accessToken, refreshToken } = jwtTokenGenerator({
    userId: user.id,
    googleId: user.googleId,
  });

  return { user, accessToken, refreshToken };
}

export async function refreshToken(token: string) {
  return jwtTokenRefresher(token);
}
