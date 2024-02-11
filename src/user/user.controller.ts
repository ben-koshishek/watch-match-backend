import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
// import { RegisterRequestDto } from '../auth/dto/register.request.dto';
import { UserService } from './user.service';
import { UserResponseDto } from './dto/user.response.dto';
// import { UpdateUserRequestDto } from './dto/update-user.request.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  // @Post()
  // async createUser(
  //   @Body() createUserRequestDto: RegisterRequestDto,
  // ): Promise<UserResponseDto> {
  //   return UserResponseDto.fromUser(
  //     await this.userService.createUser(createUserRequestDto),
  //   );
  // }

  // @Patch(':id')
  // async updateUser(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() updateUserDto: UpdateUserRequestDto,
  // ): Promise<UserResponseDto> {
  //   return UserResponseDto.fromUser(
  //     await this.userService.updateUser(id, updateUserDto),
  //   );
  // }
}
