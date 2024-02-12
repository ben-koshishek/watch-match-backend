import { Injectable } from '@nestjs/common';
import { google, youtube_v3 } from 'googleapis';

@Injectable()
export class YoutubeApiService {
  private readonly youtube;

  constructor() {
    this.youtube = google.youtube({
      version: 'v3',
    });
  }

  async getMyChannel(
    accessToken: string,
  ): Promise<youtube_v3.Schema$ChannelListResponse> {
    // Ensure the Google API client uses the provided access token for this request
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    return this.youtube.channels.list({
      auth,
      part: ['snippet', 'contentDetails', 'statistics'],
      mine: true,
    });
  }

  async getAllLikedVideos(
    accessToken: string,
  ): Promise<youtube_v3.Schema$Video[]> {
    const youtube = google.youtube('v3');
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    let pageToken = '';
    const likedVideos: youtube_v3.Schema$Video[] = [];

    do {
      const response = await youtube.videos.list({
        auth: auth,
        part: ['snippet', 'contentDetails', 'statistics'],
        myRating: 'like',
        maxResults: 50,
        pageToken: pageToken,
      });

      if (response.data.items) {
        likedVideos.push(...response.data.items);
      }

      pageToken = response.data.nextPageToken || '';
    } while (pageToken);

    return likedVideos;
  }
}
