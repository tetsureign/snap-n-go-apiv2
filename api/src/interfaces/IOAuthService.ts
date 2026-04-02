import { User } from "@/generated/prisma/client";

export default interface IOAuthService {
  loginWithToken(token: string): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }>;

  verifyToken(idToken: string): Promise<unknown>;
}
