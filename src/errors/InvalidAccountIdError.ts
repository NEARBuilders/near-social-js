// enums
import { ErrorCodeEnum } from '@app/enums';

// errors
import BaseError from './BaseError';

export default class InvalidAccountIdError extends BaseError {
  public readonly accountId: string;
  public readonly code = ErrorCodeEnum.InvalidAccountIdError;
  public readonly name: string = 'InvalidAccountIdError';

  constructor(accountId: string, message?: string) {
    super(message || `account id "${accountId}" not a valid account`);

    this.accountId = accountId;
  }
}
