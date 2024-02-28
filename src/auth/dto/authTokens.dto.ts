import { ApiProperty } from '@nestjs/swagger';

export class AuthTokens {
  @ApiProperty({
    description: 'Access token for accessing protected routes',
  })
  accessToken: string;
  @ApiProperty({
    description: 'Refresh token for generating a new access token',
  })
  refreshToken: string;
}
