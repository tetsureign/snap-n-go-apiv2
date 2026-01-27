import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import * as jwt from 'jsonwebtoken';
import { UserService } from '../user/user.service';
import { User } from '../generated/client/client';

interface JwtPayload {
  userId: string;
  googleId: string | null;
  email: string;
}

@Injectable()
export class AuthService {
  private oauth2Client: OAuth2Client;
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly jwtRefreshExpiresIn: string;
  private readonly googleClientId: string;

  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    this.jwtSecret = this.configService.get<string>('JWT_SECRET', 'secret');
    this.jwtRefreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'refresh-secret',
    );
    this.jwtExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '1h');
    this.jwtRefreshExpiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
      '7d',
    );
    this.googleClientId = this.configService.get<string>(
      'GOOGLE_CLIENT_ID',
      '',
    );

    this.oauth2Client = new OAuth2Client(this.googleClientId);
  }

  async verifyGoogleToken(idToken: string) {
    try {
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken,
        audience: this.googleClientId,
      });
      return ticket.getPayload();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async loginWithGoogle(token: string) {
    const googleUser = await this.verifyGoogleToken(token);
    if (!googleUser) {
      throw new UnauthorizedException('Invalid Google token');
    }

    const { sub: googleId, email, name } = googleUser;

    if (!googleId || !email || !name) {
      throw new UnauthorizedException('Missing Google user info');
    }

    const user = await this.userService.createOrUpdate({
      googleId,
      email,
      name,
    });

    const tokens = this.generateTokens(user);

    return {
      user,
      ...tokens,
    };
  }

  generateTokens(user: User) {
    const payload: JwtPayload = {
      userId: user.id,
      googleId: user.googleId,
      email: user.email,
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, this.jwtRefreshSecret, {
      expiresIn: this.jwtRefreshExpiresIn,
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = jwt.verify(
        refreshToken,
        this.jwtRefreshSecret,
      ) as JwtPayload;
      const user = await this.userService.findOne(payload.userId);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  verifyAccessToken(token: string) {
    try {
      return jwt.verify(token, this.jwtSecret) as JwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
