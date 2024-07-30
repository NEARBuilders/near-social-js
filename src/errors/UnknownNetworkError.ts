// enums
import { ErrorCodeEnum } from '@app/enums';

// errors
import BaseError from './BaseError';

export default class UnknownNetworkError extends BaseError {
  public readonly networkID: string;
  public readonly code = ErrorCodeEnum.UnknownNetworkError;
  public readonly name: string = 'UnknownNetworkError';

  constructor(networkID: string, message?: string) {
    super(message || `network ID "${networkID}" not known`);

    this.networkID = networkID;
  }
}
