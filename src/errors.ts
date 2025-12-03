export enum ErrorCode {
  InvalidAccountIdError = 2000,
  AccountNotFoundError = 2001,
  KeyNotAllowedError = 3000,
  UnknownNetworkError = 4000,
}

export class SocialError extends Error {
  public readonly code: ErrorCode;
  public readonly name: string;

  constructor(code: ErrorCode, message: string, name: string) {
    super(message.toLowerCase());
    this.code = code;
    this.name = name;
  }
}

export class AccountNotFoundError extends SocialError {
  public readonly accountId: string;

  constructor(accountId: string, message?: string) {
    super(
      ErrorCode.AccountNotFoundError,
      message || `account "${accountId}" not found`,
      'AccountNotFoundError'
    );
    this.accountId = accountId;
  }
}

export class InvalidAccountIdError extends SocialError {
  public readonly accountId: string;

  constructor(accountId: string, message?: string) {
    super(
      ErrorCode.InvalidAccountIdError,
      message || `account id "${accountId}" not a valid account`,
      'InvalidAccountIdError'
    );
    this.accountId = accountId;
  }
}

export class KeyNotAllowedError extends SocialError {
  public readonly key: string;

  constructor(key: string, message?: string) {
    super(
      ErrorCode.KeyNotAllowedError,
      message || `key "${key}" not valid`,
      'KeyNotAllowedError'
    );
    this.key = key;
  }
}

export class UnknownNetworkError extends SocialError {
  public readonly networkId: string;

  constructor(networkId: string, message?: string) {
    super(
      ErrorCode.UnknownNetworkError,
      message || `network ID "${networkId}" not known`,
      'UnknownNetworkError'
    );
    this.networkId = networkId;
  }
}
