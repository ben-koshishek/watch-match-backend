import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({
    description: 'Google token ID obtained after Google sign-in',
    example: 'your_google_token_id_here',
  })
  googleTokenId: string;
}
