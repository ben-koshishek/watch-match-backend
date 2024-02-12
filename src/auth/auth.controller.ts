import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService, AuthTokens } from './auth.service';
import { User } from '../user/user.entity';
import { Public } from './public.decorator';

type RequestWithUser = Request & { user: User };

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('me')
  async getMe(@Req() req: RequestWithUser): Promise<any> {
    return this.authService.getMe(req.user.id);
  }

  @Public()
  @Post('/signup')
  async signUp(@Body('googleTokenId') googleTokenId: string) {
    const payload = await this.authService.verifyGoogleToken(googleTokenId);

    return payload;
  }

  @Post('/login')
  async signIn(
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(email, password);
  }

  @Public()
  @Post('/refresh-token')
  async refreshToken(
    @Body('refreshToken') refreshToken: string,
  ): Promise<AuthTokens> {
    return this.authService.refreshAccessToken(refreshToken);
  }
}
