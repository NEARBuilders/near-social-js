// enums
import { ErrorCodeEnum } from '@app/enums';

// errors
import BaseError from './BaseError';

export default class KeyNotAllowedError extends BaseError {
  public readonly code = ErrorCodeEnum.KeyNotAllowedError;
  public readonly key: string;
  public readonly name: string = 'KeyNotAllowedError';

  constructor(key: string, message?: string) {
    super(message || `key "${key}" not valid`);

    this.key = key;
  }
}
