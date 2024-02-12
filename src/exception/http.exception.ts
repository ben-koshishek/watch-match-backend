import { lowerFirst } from 'lodash';

class HttpException extends Error {
  public cause: any;

  public statusCode: number;

  constructor(statusCode: number, message: string, cause?: any) {
    super(message);
    this.cause = cause;
    this.statusCode = statusCode;
  }

  printCause = (cause: any): any => {
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

  public print = () => {
    return this.printCause(this);
  };

  public getMessage = () => this.message;

  public getCause = () => this.cause;

  public getStatus = () => this.statusCode;

  public getJson = (exposeCause = false) => {
    if (exposeCause) {
      return {
        error: {
          statusCode: this.getStatus(),
          message: this.getMessage(),
          causedBy: this.printCause(this.getCause()),
        },
      };
    }
    return { error: { code: this.getStatus(), message: this.getMessage() } };
  };
}

export default HttpException;
