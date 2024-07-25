# Errors

## Summary

| Code | Name                                              | Summary                           |
|------|---------------------------------------------------|-----------------------------------|
| 2000 | [`InvalidAccountIdError`](#invalidaccountiderror) | When an account ID is invalid.    |
| 3000 | [`KeyNotAllowedError`](#keynotallowederror)       | When a key is not allowed.        |
| 4000 | [`UnknownNetworkError`](#unknownnetworkerror)     | When the network ID is not known. |

## `InvalidAccountIdError`

This error is thrown when an account is invalid.

#### Properties

| Name      | Type     | Value | Description                      |
|-----------|----------|-------|----------------------------------|
| accountId | `string` | -     | The account ID that is invalid.  |
| code      | `number` | 2000  | A canonical code for this error. |
| message   | `string` | -     | A human readable message.        |

## `KeyNotAllowedError`

This error is thrown when a key is not allowed, usually when an account has not been given access to the key.

#### Properties

| Name    | Type     | Value | Description                                   |
|---------|----------|-------|-----------------------------------------------|
| code    | `number` | 3000  | A canonical code for this error.              |
| key     | `string` | -     | The key that is not allowed.                  |
| message | `string` | -     | A human readable message.                     |

## `UnknownNetworkError`

This error is thrown when initializing the SDK and the network ID supplied, is not known.

#### Properties

| Name      | Type     | Value | Description                      |
|-----------|----------|-------|----------------------------------|
| code      | `number` | 4000  | A canonical code for this error. |
| message   | `string` | -     | A human readable message.        |
| networkID | `string` | -     | The network ID that is invalid.  |
