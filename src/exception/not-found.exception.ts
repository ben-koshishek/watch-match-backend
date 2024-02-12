import HttpException from './http.exception';
import { HttpStatus } from '@nestjs/common';

export class NotFoundException extends HttpException {
  public toHttpException = () =>
    new HttpException(HttpStatus.NOT_FOUND, 'not found', this);
}
