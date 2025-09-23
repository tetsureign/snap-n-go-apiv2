import { asClass, createContainer, InjectionMode } from "awilix";

import GoogleOAuthConfigService from "@/services/googleAuth/GoogleOAuthConfigService";
import GoogleOAuthService from "@/services/googleAuth/GoogleOAuthService";
import GoogleJwtService from "@/services/googleAuth/GoogleJwtService";

import IJwtService from "@/interfaces/IJwtService";
import IOAuthService from "@/interfaces/IOAuthService";
import IOAuthConfigService from "@/interfaces/IOAuthConfigService";

export interface DIContainer {
  configService: IOAuthConfigService;
  jwtService: IJwtService;
  googleOAuthService: IOAuthService;
}

export const container = createContainer<DIContainer>({
  injectionMode: InjectionMode.PROXY,
});

// Register services
container.register({
  configService: asClass(GoogleOAuthConfigService).singleton(),
  googleOAuthService: asClass(GoogleOAuthService).singleton(),
  jwtService: asClass(GoogleJwtService).singleton(),
});

export default container;
