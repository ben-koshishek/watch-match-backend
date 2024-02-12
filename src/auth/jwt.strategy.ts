import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { AuthConfig } from 'src/config/config';

export interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    const options = {
      secretOrKey: configService.get<AuthConfig>('auth').secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    };

    super(options);
  }

  async validate(payload: JwtPayload): Promise<User | boolean> {
    const { sub } = payload;
    const user: User = await this.userService.findOneBy({ id: sub });

    if (!user) {
      return false;
    }

    return user;
  }
}
