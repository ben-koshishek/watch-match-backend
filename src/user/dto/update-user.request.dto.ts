import { PartialType } from '@nestjs/mapped-types';
import { User } from '../user.entity';

export class UpdateUserRequestDto extends PartialType(User) {}
