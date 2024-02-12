import { HttpStatus } from '@nestjs/common';
import RuntimeException from './runtime.exception';
import HttpException from './http.exception';

export class AuthException extends RuntimeException {
  public toHttpException = () =>
    new HttpException(HttpStatus.UNAUTHORIZED, 'unauthorized', this);
}
