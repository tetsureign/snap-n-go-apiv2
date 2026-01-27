import {
  Body,
  Controller,
  Param,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenDto } from './dto/token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login/oauth/:provider')
  async loginOAuth(
    @Param('provider') provider: string,
    @Body() body: TokenDto,
  ) {
    if (provider !== 'google') {
      throw new BadRequestException(`Unsupported OAuth provider: ${provider}`);
    }

    const { user, accessToken, refreshToken } =
      await this.authService.loginWithGoogle(body.token);

    return {
      success: true,
      data: user,
      accessToken,
      refreshToken,
    };
  }

  @Post('refresh')
  async refreshToken(@Body() body: TokenDto) {
    const { accessToken, refreshToken } = await this.authService.refreshTokens(
      body.token,
    );

    return {
      success: true,
      accessToken,
      refreshToken,
    };
  }
}
