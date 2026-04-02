import { BadRequestError } from "@/shared/errors/appError";
import { env } from "@/config/env";

import { createGoogleJwtService } from "@/modules/auth/googleJwtService";
import { createGoogleOAuthService } from "@/modules/auth/googleOAuthService";
import {
  AuthConfig,
  JwtService,
  OAuthProvider,
  OAuthService,
} from "@/modules/auth/auth.types";

const authConfig: AuthConfig = {
  jwtSecret: env.jwtSecret,
  refreshSecret: env.refreshSecret,
  clientId: env.googleClientId,
  accessTokenExpiry: "1h",
  refreshTokenExpiry: "30d",
};

const jwtService: JwtService = createGoogleJwtService(authConfig);

const oauthProviders = {
  google: createGoogleOAuthService(authConfig, jwtService),
} satisfies Record<OAuthProvider, OAuthService>;

function getOAuthProvider(provider: string): OAuthService {
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
