import { asClass, asFunction, createContainer, InjectionMode } from "awilix";
import { GoogleOAuthConfigService } from "@/services/googleAuthServices/GoogleOAuthConfigService";
import { GoogleOAuthService } from "@/services/googleAuthServices/GoogleOAuthService";
import { GoogleJwtService } from "@/services/googleAuthServices/GoogleJwtService";
import { GoogleAuthService } from "@/services/googleAuthServices/GoogleAuthService";
import { IAuthService } from "@/interfaces/IAuthService";
import { IJwtService } from "@/interfaces/IJwtService";
import { IOAuthService } from "@/interfaces/IOAuthService";
import { IOAuthConfigService } from "@/interfaces/IOAuthConfigService";

export interface DIContainer {
  configService: IOAuthConfigService;
  oauthService: IOAuthService;
  jwtService: IJwtService;
  googleAuthService: IAuthService;
  // Future providers can be added here
  // facebookAuthService: IAuthService;
  // discordAuthService: IAuthService;
}

export const container = createContainer<DIContainer>({
  injectionMode: InjectionMode.PROXY,
});

// Register services
container.register({
  configService: asClass(GoogleOAuthConfigService).singleton(),
  oauthService: asClass(GoogleOAuthService).singleton(),
  jwtService: asClass(GoogleJwtService).singleton(),
  googleAuthService: asClass(GoogleAuthService).singleton(),
  // Future providers can be registered here
  // facebookAuthService: asClass(FacebookAuthService).singleton(),
  // appleAuthService: asClass(AppleAuthService).singleton(),
});

export default container;
