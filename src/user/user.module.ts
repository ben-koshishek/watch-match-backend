import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { YoutubeApiService } from 'src/youtube-api/youtube-api.service';
// import { YoutubeActivityService } from 'src/youtube-activity/youtube-activity.service';
// import { YoutubeActivity } from 'src/youtube-activity/youtube-activity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
