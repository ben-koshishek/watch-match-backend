import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { User } from '../user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 1, description: 'The unique identifier of the user' })
  @IsNotEmpty()
  id: number;

  @ApiProperty({ example: 'johndoe', description: 'The username of the user' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'ben.koshishek@example.com',
    description: 'The email of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Ben', description: 'The first name of the user' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Koshishek',
    description: 'The last name of the user',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: 'https://example.com/profile.jpg',
    description: 'The profile picture URL of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  profilePicture?: string;

  constructor({
    id,
    username,
    email,
    firstName,
    lastName,
    profilePicture,
  }: UserResponseDto) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.profilePicture = profilePicture;
  }

  public static fromUser(user: User): UserResponseDto {
    return new UserResponseDto({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture,
    });
  }
}
