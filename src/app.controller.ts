import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/public.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor() {}

  @ApiOperation({ summary: 'Status check endpoint' })
  @ApiResponse({ status: 200 })
  @Get()
  @Public()
  getHello(): string {
    return 'Hello World!444';
  }
}
