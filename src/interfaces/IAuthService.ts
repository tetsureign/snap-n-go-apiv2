export default interface IAuthService {
  loginWithToken(token: string): Promise<{
    user: any;
    accessToken: string;
    refreshToken: string;
  }>;
  refreshToken(
    token: string
  ): Promise<{ accessToken: string; refreshToken: string }>;
}
