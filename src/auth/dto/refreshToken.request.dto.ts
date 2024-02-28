import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token for generating a new access token',
    example: 'your_refresh_token_here',
  })
  refreshToken: string;
}
