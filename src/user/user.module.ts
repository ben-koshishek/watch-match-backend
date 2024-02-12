import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YoutubeActivityModule } from 'src/youtube-activity/youtube-activity.module';
import { YoutubeActivity } from 'src/youtube-activity/youtube-activity.entity';

// import { YoutubeApiService } from 'src/youtube-api/youtube-api.service';
// import { YoutubeActivityService } from 'src/youtube-activity/youtube-activity.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, YoutubeActivity]),
    YoutubeActivityModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
