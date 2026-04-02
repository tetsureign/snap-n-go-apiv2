import { env } from "@/config/env";
import IOAuthConfigService from "@/interfaces/IOAuthConfigService";

export default class GoogleOAuthConfigService implements IOAuthConfigService {
  public readonly jwtSecret: string;
  public readonly refreshSecret: string;
  public readonly clientId: string;
  public readonly accessTokenExpiry: string;
  public readonly refreshTokenExpiry: string;

  constructor() {
    this.jwtSecret = env.jwtSecret;
    this.refreshSecret = env.refreshSecret;
    this.clientId = env.googleClientId;
    this.accessTokenExpiry = "1h";
    this.refreshTokenExpiry = "30d";
  }
}
