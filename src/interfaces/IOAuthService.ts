export interface IOAuthService {
  verifyToken(idToken: string): Promise<any>;
}
