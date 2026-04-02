import IJwtService from "@/interfaces/IJwtService";
import IOAuthService from "@/interfaces/IOAuthService";

import GoogleOAuthConfigService from "@/services/googleAuth/GoogleOAuthConfigService";
import GoogleJwtService from "@/services/googleAuth/GoogleJwtService";
import GoogleOAuthService from "@/services/googleAuth/GoogleOAuthService";

const configService = new GoogleOAuthConfigService();
const jwtService: IJwtService = new GoogleJwtService(configService);

type OauthProviders = "google";

const oauthProviders = {
  google: new GoogleOAuthService(configService, jwtService),
} satisfies Record<OauthProviders, IOAuthService>;

function getOAuthProvider(provider: string): IOAuthService {
  const normalizedProvider = provider.toLowerCase() as OauthProviders;
  const oauthProvider = oauthProviders[normalizedProvider];

  if (!oauthProvider) {
    throw new Error(`Unsupported OAuth provider: ${provider}`);
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
