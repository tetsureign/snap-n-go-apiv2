import { OAuth2Client } from "google-auth-library";
import { IOAuthConfigService, IOAuthService } from "@/interfaces/services";

export class GoogleOAuthService implements IOAuthService {
  private oauth2Client: OAuth2Client;

  constructor(private configService: IOAuthConfigService) {
    this.oauth2Client = new OAuth2Client(this.configService.clientId);
  }

  async verifyToken(idToken: string) {
    try {
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken,
        audience: this.configService.clientId,
      });

      return ticket.getPayload();
    } catch (error) {
      console.error(error, "Error verifying Google token.");
      return null;
    }
  }
}
