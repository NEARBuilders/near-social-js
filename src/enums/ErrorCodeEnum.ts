enum ErrorCodeEnum {
  // accounts
  InvalidAccountIdError = 2000,
  AccountNotFoundError = 2001,

  // keys
  KeyNotAllowedError = 3000,

  // network
  UnknownNetworkError = 4000,
}

export default ErrorCodeEnum;
