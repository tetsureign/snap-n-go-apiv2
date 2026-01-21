export default interface IOAuthService {
  loginWithToken(token: string): Promise<{
    user: any;
    accessToken: string;
    refreshToken: string;
  }>;

  verifyToken(idToken: string): Promise<any>;
}
