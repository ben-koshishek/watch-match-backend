import { Module } from '@nestjs/common';
import { YoutubeActivityService } from './youtube-activity.service';
import { YoutubeActivity } from './youtube-activity.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([YoutubeActivity])],
  providers: [YoutubeActivityService],
  exports: [YoutubeActivityService],
})
export class YoutubeActivityModule {}
