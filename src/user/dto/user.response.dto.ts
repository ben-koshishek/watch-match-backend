import { User } from '../user.entity';

export class UserResponseDto {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;

  constructor({
    id,
    username,
    email,
    firstName,
    lastName,
    profilePicture,
  }: Partial<User>) {
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
