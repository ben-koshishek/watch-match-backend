import { youtube_v3 } from 'googleapis';
import { YoutubeActivity } from '../youtube-activity.entity';
import { User } from 'src/user/user.entity';

export class YouTubeActivityDto {
  videoId: string;
  videoTitle: string;

  constructor({ videoId, videoTitle }: Partial<YoutubeActivity>) {
    this.videoId = videoId;
    this.videoTitle = videoTitle;
  }

  public static fromYoutubeApi(video: youtube_v3.Schema$Video, userId: number) {
    return new YouTubeActivityDto({
      videoId: video.id,
      videoTitle: video.snippet.title,
      user: { id: userId } as User,
    });
  }
}
