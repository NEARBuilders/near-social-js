# API Reference

## Classes

### `Social`
High-level class with convenience methods for common social features.

**Methods:**
- `getProfile(accountId)` — Get a user's profile
- `setProfile(signerId, profile)` — Update profile data
- `getPost(accountId, blockHeight)` — Get a post
- `createPost(signerId, post)` — Create a new post
- `getFollowers(accountId)` — Get accounts following a user
- `getFollowing(accountId)` — Get accounts a user follows
- `follow(signerId, accountId)` — Follow an account
- `unfollow(signerId, accountId)` — Unfollow an account
- `like(signerId, item)` — Like an item
- `getLikes(item)` — Get likes for an item

### `Graph`
Low-level class for direct contract interaction. `Social` extends this class.

**Methods:**
- `get(options)` — Read data by key patterns
- `keys(options)` — Query key structure
- `index(options)` — Query indexed data
- `set(options)` — Store data
- `getVersion()` — Get contract version
- `getAccount(options)` — Get account info
- `getAccounts(options)` — List accounts
- `isWritePermissionGranted(options)` — Check write permissions
- `grantWritePermission(options)` — Grant write access
- `storageBalanceOf(accountId)` — Check storage balance
- `storageDeposit(options)` — Deposit for storage
- `storageWithdraw(options)` — Withdraw storage balance
- `storageUnregister(options)` — Unregister account from storage (requires 1 yoctoNEAR)

---

## Errors

| Code | Error | Description |
|------|-------|-------------|
| 2000 | `InvalidAccountIdError` | Account ID is invalid |
| 3000 | `KeyNotAllowedError` | Key access not permitted |
| 4000 | `UnknownNetworkError` | Network ID not recognized |

### `InvalidAccountIdError`
Thrown when an account ID doesn't match NEAR's account format.

```typescript
{
  code: 2000,
  accountId: string,  // The invalid account ID
  message: string
}
```

### `KeyNotAllowedError`
Thrown when attempting to write to a key without permission.

```typescript
{
  code: 3000,
  key: string,  // The disallowed key
  message: string
}
```

### `UnknownNetworkError`
Thrown when initializing with an unrecognized network ID.

```typescript
{
  code: 4000,
  networkId: string,  // The unknown network
  message: string
}
```
