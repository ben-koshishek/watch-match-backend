import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/public.decorator';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  @Public()
  getHello(): string {
    return 'Hello World!3';
  }
}
