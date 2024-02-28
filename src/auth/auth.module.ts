import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { YoutubeApiModule } from 'src/youtube-api/youtube-api.module';
import { YoutubeActivityModule } from 'src/youtube-activity/youtube-activity.module';
import { OAuth2Client } from 'google-auth-library';
import { TokenService } from './token.service';
import { AuthConfig } from 'src/config/types';
// import { YoutubeActivity } from 'src/youtube-activity/youtube-activity.entity';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<AuthConfig>('auth').secret,
        signOptions: {
          expiresIn: configService.get<AuthConfig>('auth').expiresIn,
        },
      }),
    }),
    TypeOrmModule.forFeature([User]),
    YoutubeApiModule,
    YoutubeActivityModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    UserService,
    OAuth2Client,
    TokenService,
  ],
  exports: [PassportModule, UserService],
})
export class AuthModule {}
