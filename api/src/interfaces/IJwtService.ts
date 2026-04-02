import { AuthToken } from "@/types";

export default interface IJwtService {
  generateTokens(payload: AuthToken): {
    accessToken: string;
    refreshToken: string;
  };
  refreshToken(
    token: string
  ): Promise<{ accessToken: string; refreshToken: string }>;
}
