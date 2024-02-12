import { lowerFirst } from 'lodash';
import HttpException from './http.exception';
import { HttpStatus } from '@nestjs/common';

class RuntimeException extends Error {
  public cause: any;

  constructor(message: string, cause?: any) {
    super(message);
    this.cause = cause;
  }

  public getName = () => this.constructor.name;

  public getMessage = () => this.message;

  public getCause = () => this.cause;

  public toHttpException = () =>
    new HttpException(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'internal server error',
      this,
    );

  public printCause = (cause: any): any => {
    if (cause && typeof cause === 'object') {
      let name = 'unknown';
      if (typeof cause?.getName === 'function') {
        name = cause.getName();
      } else if (cause.name) {
        name = cause.name;
      }
      let message = 'unknown';
      if (typeof cause?.getMessage === 'function') {
        message = cause.getMessage();
      } else if (cause.name) {
        message = cause.message;
      }
      let innerCause;
      if (typeof cause?.getCause === 'function') {
        innerCause = this.printCause(cause.getCause());
      }
      const result = {
        name,
        message,
        causedBy: innerCause,
        stack: cause.stack,
      };
      if (name === 'unknown') {
        result['error'] = cause;
      }
      for (const fnName of Object.getOwnPropertyNames(cause)) {
        if (
          fnName.startsWith('get') &&
          typeof cause[fnName] === 'function' &&
          fnName !== 'getCause'
        ) {
          result[lowerFirst(fnName.substring(3))] = cause[fnName]() || null;
        }
      }
      return result;
    }
    return cause;
  };

  public print() {
    return this.printCause(this);
  }
}

export default RuntimeException;
