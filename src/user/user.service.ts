import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { YoutubeActivityService } from 'src/youtube-activity/youtube-activity.service';
import { UpdateUserRequestDto } from './dto/update-user.request.dto';
// import { RegisterRequestDto } from '../auth/dto/register.request.dto';
// import { UpdateUserRequestDto } from './dto/update-user.request.dto';
// import { YoutubeApiService } from 'src/youtube-api/youtube-api.service';
// import { YouTubeActivityDto } from 'src/youtube-activity/dto/youtube-activity.dto';
// import { YoutubeActivityService } from '../youtube-activity/youtube-activity.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    // private readonly youtubeApiService: YoutubeApiService,
    private readonly youtubeActivityService: YoutubeActivityService,
  ) {}

  async createUser(userData: Partial<User>): Promise<User> {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      birthDate,
      profilePicture,
    } = userData;

    const userExists = await this.userRepository.findOneBy({ email });

    if (userExists) {
      throw new ConflictException({
        message: 'User already exists',
        details: { email: userExists.email },
      });
    }

    const newUserData = {
      username,
      firstName,
      lastName,
      email,
      birthDate,
      profilePicture,
      password,
    };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      newUserData.password = hashedPassword;
    }
    try {
      const newUser = this.userRepository.create(newUserData);

      return await this.userRepository.save(newUser);
    } catch (error) {
      this.logger.error(`Failed to create a user for ${email}`, error.stack);
      throw new ConflictException('There was a problem creating the user');
    }
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserRequestDto,
  ): Promise<User> {
    const user = await this.userRepository.preload({
      id: id,
      ...updateUserDto,
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return this.userRepository.save(user);
  }

  async findOneBy(options: FindOptionsWhere<User>): Promise<User> {
    const user = await this.userRepository.findOneBy(options);

    if (!user) {
      throw new NotFoundException(
        `User with ${JSON.stringify(options)} not found`,
      );
    }

    return user;
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    // const channels = await this.youtubeApiService.getMyChannel(user.googleAccessToken);
    return user;
  }

  async getProfileData(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // user = await this.updateYoutubeActivities(user);

    return await this.userRepository.save(user);
  }

  async findUserByRefreshToken(tokenValue: string): Promise<User | undefined> {
    // Example for PostgreSQL using QueryBuilder
    // Adjust the query according to your database structure and SQL dialect
    return this.userRepository
      .createQueryBuilder('user')
      .where("user.refreshToken ->> 'value' = :tokenValue", { tokenValue })
      .getOne();
  }

  // private async updateYoutubeActivities(user: User): Promise<User> {
  //   const likedVideos = await this.youtubeApiService.getAllLikedVideos(
  //     user.googleAccessToken,
  //   );
  //   const youtubeActivities = likedVideos.map((video) =>
  //     YouTubeActivityDto.fromYoutubeApi(video, user.id),
  //   );

  //   const updatedActivities =
  //     await this.youtubeActivityService.save(youtubeActivities);

  //   user.youtubeActivities = updatedActivities;
  //   return await this.userRepository.save(user);
  // }
}
