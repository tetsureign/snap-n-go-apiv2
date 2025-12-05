import { TokenSchema } from "@/types";

export default interface IJwtService {
  generateTokens(payload: TokenSchema): {
    accessToken: string;
    refreshToken: string;
  };
  refreshToken(
    token: string
  ): Promise<{ accessToken: string; refreshToken: string }>;
}
