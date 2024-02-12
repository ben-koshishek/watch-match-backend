import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { UserService } from 'src/user/user.service';
import { AuthTokens } from './auth.service';
import { User } from 'src/user/user.entity';
import { AuthException } from 'src/exception/authentication.exception';
import { JwtPayload } from './jwt.strategy';

export type RefreshTokenPayload = {
  value: string;
  expiresIn: number;
};

@Injectable()
export class TokenService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  generateRefreshTokenPayload(): RefreshTokenPayload {
    const token = randomBytes(40).toString('hex');
    const expiresIn = 7 * 24 * 60 * 60 * 1000;

    return {
      value: token,
      expiresIn: Date.now() + expiresIn,
    };
  }

  async validateRefreshToken(refreshToken: string): Promise<User> {
    const user = await this.userService.findOneBy({
      refreshToken,
    });

    if (!user) {
      throw new AuthException('Invalid refresh token', refreshToken);
    }

    // if (refreshToken.expiresIn > Date.now()) {
    //   throw new AuthException('Token has expired', refreshToken.value);
    // }

    return user;
  }

  async generateAuthTokens(payload: JwtPayload): Promise<AuthTokens> {
    try {
      const user = await this.userService.findOneBy({ email: payload.email });
      const refreshTokenPayload = this.generateRefreshTokenPayload();
      const refreshToken = this.jwtService.sign(refreshTokenPayload, {
        expiresIn: refreshTokenPayload.expiresIn,
      });
      const accessToken = this.jwtService.sign(payload);

      const updatedUser = await this.userService.updateUser(user.id, {
        refreshToken,
      });
      return {
        accessToken,
        refreshToken: updatedUser.refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }
}
