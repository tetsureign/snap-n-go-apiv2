import IOAuthConfigService from "@/interfaces/IOAuthConfigService";

export class GoogleOAuthConfigService implements IOAuthConfigService {
  public readonly jwtSecret: string;
  public readonly refreshSecret: string;
  public readonly clientId: string;
  public readonly accessTokenExpiry: string;
  public readonly refreshTokenExpiry: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET!;
    this.refreshSecret = process.env.REFRESH_SECRET!;
    this.clientId = process.env.GOOGLE_CLIENT_ID!;
    this.accessTokenExpiry = "1h";
    this.refreshTokenExpiry = "30d";

    // Validate required environment variables
    if (!this.jwtSecret) {
      throw new Error("JWT_SECRET environment variable is required");
    }
    if (!this.refreshSecret) {
      throw new Error("REFRESH_SECRET environment variable is required");
    }
    if (!this.clientId) {
      throw new Error("GOOGLE_CLIENT_ID environment variable is required");
    }
  }
}
