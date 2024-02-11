import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
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
    // private readonly youtubeActivityService: YoutubeActivityService,
  ) {}

  // async createUser(userData: RegisterRequestDto): Promise<User> {
  //   const {
  //     username,
  //     email,
  //     password,
  //     firstName,
  //     lastName,
  //     birthDate,
  //     profilePicture,
  //   } = userData;

  //   const userExists = await this.userRepository.findOneBy({ email, username });

  //   if (userExists) {
  //     throw new ConflictException({
  //       message: 'User already exists',
  //       details: { email: userExists.email, username: userExists.username },
  //     });
  //   }

  //   const hashedPassword = await bcrypt.hash(password, 12);

  //   const newUser = this.userRepository.create({
  //     username,
  //     firstName,
  //     lastName,
  //     email,
  //     birthDate,
  //     profilePicture,
  //     password: hashedPassword,
  //   });

  //   try {
  //     return await this.userRepository.save(newUser);
  //   } catch (error) {
  //     this.logger.error(`Failed to create a user for ${email}`, error.stack);
  //     throw new ConflictException('There was a problem creating the user');
  //   }
  // }

  // async updateUser(
  //   id: number,
  //   updateUserDto: UpdateUserRequestDto,
  // ): Promise<User> {
  //   const user = await this.userRepository.preload({
  //     id: id,
  //     ...updateUserDto,
  //   });

  //   if (!user) {
  //     throw new NotFoundException(`User #${id} not found`);
  //   }

  //   return this.userRepository.save(user);
  // }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    // const channels = await this.youtubeApiService.getMyChannel(user.googleAccessToken);
    return user;
  }
  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

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
