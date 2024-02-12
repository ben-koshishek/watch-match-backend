import { Module } from '@nestjs/common';
import { YoutubeApiService } from './youtube-api.service';

@Module({
  providers: [YoutubeApiService],
  exports: [YoutubeApiService],
})
export class YoutubeApiModule {}
