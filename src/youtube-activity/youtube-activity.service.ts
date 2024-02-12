import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { YoutubeActivity } from './youtube-activity.entity';
import { YouTubeActivityDto } from './dto/youtube-activity.dto';

export class YoutubeActivityService {
  constructor(
    @InjectRepository(YoutubeActivity)
    private readonly youtubeActivityRepository: Repository<YoutubeActivity>,
  ) {}

  async save(activities: YouTubeActivityDto[]): Promise<YoutubeActivity[]> {
    return await this.youtubeActivityRepository.save(activities);
  }
}
