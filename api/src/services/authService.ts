import IJwtService from "@/interfaces/IJwtService";
import IOAuthService from "@/interfaces/IOAuthService";
import { BadRequestError } from "@/errors/appError";

import GoogleOAuthConfigService from "@/services/googleAuth/GoogleOAuthConfigService";
import GoogleJwtService from "@/services/googleAuth/GoogleJwtService";
import GoogleOAuthService from "@/services/googleAuth/GoogleOAuthService";
import { OAuthProvider } from "@/types/auth";

const configService = new GoogleOAuthConfigService();
const jwtService: IJwtService = new GoogleJwtService(configService);

const oauthProviders = {
  google: new GoogleOAuthService(configService, jwtService),
} satisfies Record<OAuthProvider, IOAuthService>;

function getOAuthProvider(provider: string): IOAuthService {
  const normalizedProvider = provider.toLowerCase() as OAuthProvider;
  const oauthProvider = oauthProviders[normalizedProvider];

  if (!oauthProvider) {
    throw new BadRequestError(`Unsupported OAuth provider: ${provider}`);
  }

  return oauthProvider;
}

async function loginWithOAuthToken(provider: string, token: string) {
  return getOAuthProvider(provider).loginWithToken(token);
}

async function refreshToken(token: string) {
  return jwtService.refreshToken(token);
}

const authService = {
  loginWithOAuthToken,
  refreshToken,
};

export default authService;
