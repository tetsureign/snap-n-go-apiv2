export default interface IOAuthConfigService {
  jwtSecret: string;
  refreshSecret: string;
  clientId: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
}
