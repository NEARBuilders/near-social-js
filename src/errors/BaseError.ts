// enums
import { ErrorCodeEnum } from '@app/enums';

export default class BaseError extends Error {
  public readonly code: ErrorCodeEnum;
  public message: string;
  public readonly name: string;

  public constructor(message: string) {
    super(message.toLowerCase());
  }
}
