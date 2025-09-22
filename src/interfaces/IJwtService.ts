import { TokenSchema } from "@/types";

export interface IJwtService {
  generateTokens(payload: TokenSchema): {
    accessToken: string;
    refreshToken: string;
  };
  refreshToken(
    token: string
  ): Promise<{ accessToken: string; refreshToken: string }>;
}
