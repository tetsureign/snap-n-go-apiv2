import { asClass, asFunction, createContainer, InjectionMode } from "awilix";
import { GoogleOAuthConfigService } from "@/services/GoogleOAuthConfigService";
import { GoogleOAuthService } from "@/services/GoogleOAuthService";
import { GoogleJwtService } from "@/services/GoogleJwtService";
import { GoogleAuthService } from "@/services/GoogleAuthService";
import {
  IOAuthConfigService,
  IOAuthService,
  IJwtService,
  IAuthService,
} from "@/interfaces/services";

export interface DIContainer {
  configService: IOAuthConfigService;
  oauthService: IOAuthService;
  jwtService: IJwtService;
  googleAuthService: IAuthService;
  // Future providers can be added here
  // facebookAuthService: IAuthService;
  // appleAuthService: IAuthService;
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
