// enums
import { ErrorCodeEnum } from '@app/enums';

// errors
import BaseError from './BaseError';

export default class AccountNotFoundError extends BaseError {
  public readonly accountId: string;
  public readonly code = ErrorCodeEnum.AccountNotFoundError;
  public readonly name: string = 'AccountNotFoundError';

  constructor(accountId: string, message?: string) {
    super(message || `account "${accountId}" not found`);

    this.accountId = accountId;
  }
}
