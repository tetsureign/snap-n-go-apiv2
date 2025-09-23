export default interface IOAuthService {
  verifyToken(idToken: string): Promise<any>;
}
