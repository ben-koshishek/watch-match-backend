import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { TokenService } from './token.service';
import { UserResponseDto } from 'src/user/dto/user.response.dto';
import { AuthTokens } from './dto/authTokens.dto';

@Injectable()
export class AuthService {
  private oauth2Client;

  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );
  }

  async signIn(email: string, password: string): Promise<AuthTokens> {
    const user = await this.userService.findOneBy({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      return this.tokenService.generateAuthTokens({
        sub: user.id,
        email: user.email,
      });
    } else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async validateUser(user: any): Promise<any> {
    const existingUser = await this.userService.findOneBy({
      email: user.email,
    });
    user = {
      ...user,
      googleAccessToken: user.accessToken,
      googleRefreshToken: user.refreshToken,
    };

    return await this.userService.updateUser(existingUser.id, user);
  }

  async verifyGoogleToken(tokenId: string): Promise<AuthTokens> {
    try {
      const { tokens } = await this.oauth2Client.getToken(tokenId);

      this.oauth2Client.setCredentials({ access_token: tokens.access_token });

      const oauth2 = google.oauth2({
        version: 'v2',
        auth: this.oauth2Client,
      });

      const userInfoResponse = await oauth2.userinfo.get();

      const user = await this.userService.createUser({
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        email: userInfoResponse.data.email,
        profilePicture: userInfoResponse.data.picture,
        firstName: userInfoResponse.data.name,
      });

      return this.tokenService.generateAuthTokens({
        email: user.email,
        sub: user.id,
      });
    } catch (error) {
      // if (error?.response?.data?.error === 'invalid_grant') {
      //   throw new UnauthorizedException(
      //     'Token has already been used or is expired',
      //   );
      // }
      throw error;
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    const user = await this.tokenService.validateRefreshToken(refreshToken);

    return this.tokenService.generateAuthTokens({
      email: user.email,
      sub: user.id,
    });
  }

  async getMe(userId: number): Promise<UserResponseDto> {
    return UserResponseDto.fromUser(
      await this.userService.getProfileData(userId),
    );
  }
}
