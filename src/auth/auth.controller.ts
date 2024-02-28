import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../user/user.entity';
import { Public } from './public.decorator';
import { UserResponseDto } from 'src/user/dto/user.response.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RefreshTokenDto } from './dto/refreshToken.request.dto';
import { SignUpDto } from './dto/signUp.request.dto';
import { AuthTokens } from './dto/authTokens.dto';

type RequestWithUser = Request & { user: User };

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({
    status: 200,
    description: 'The user details',
    type: UserResponseDto,
  })
  @Get('me')
  async getMe(@Req() req: RequestWithUser): Promise<UserResponseDto> {
    return this.authService.getMe(req.user.id);
  }

  @Public()
  @ApiOperation({ summary: 'Sign up using Google Token' })
  @ApiBody({ type: SignUpDto })
  @ApiResponse({
    status: 201,
    description: 'Sign up successful',
    type: AuthTokens,
  })
  @Post('/signup')
  async signUp(
    @Body('googleTokenId') googleTokenId: string,
  ): Promise<AuthTokens> {
    const payload = await this.authService.verifyGoogleToken(googleTokenId);

    return payload;
  }

  @Public()
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Access token refreshed',
    type: AuthTokens,
  })
  @Post('/refresh-token')
  async refreshToken(
    @Body('refreshToken') refreshToken: string,
  ): Promise<AuthTokens> {
    return this.authService.refreshAccessToken(refreshToken);
  }
}
