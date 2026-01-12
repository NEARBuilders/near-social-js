# API Reference

## Classes

### `Social`
High-level class with convenience methods for common social features.

**Profile Methods:**
- `getProfile(accountId)` — Get a user's profile
- `setProfile(signerId, profile)` — Update profile data

**Post Methods:**
- `getPost(accountId, blockHeight, options?)` — Get a post (optionally with comments)
- `createPost(signerId, post)` — Create a new post with auto-extraction of @mentions and #hashtags

**Comment Methods:**
- `createComment(signerId, comment)` — Create a comment with auto-extraction of @mentions and #hashtags
- `getComments(item)` — Get comments for a post/item

**Follow Methods:**
- `getFollowers(accountId)` — Get accounts following a user
- `getFollowing(accountId)` — Get accounts a user follows
- `follow(signerId, accountId)` — Follow an account (sends notification)
- `unfollow(signerId, accountId)` — Unfollow an account

**Like Methods:**
- `like(signerId, item)` — Like an item (sends notification)
- `getLikes(item)` — Get likes for an item
- `unlike(signerId, item)` — Unlike an item

**Repost Methods:**
- `repost(signerId, item)` — Repost content (sends notification)
- `getReposts(item)` — Get reposts for an item

**Feed Methods:**
- `getAccountFeed(accountId, options?)` — Get posts from a specific account (supports `includeReplies` option)
- `getHashtagFeed(hashtag, options?)` — Get posts tagged with a hashtag
- `getActivityFeed(options?)` — Get all recent posts
- `getMentionedFeed(accountId, options?)` — Get posts where account was mentioned

**Notification Methods:**
- `getNotifications(accountId, options?)` — Get all notifications (mentions, likes, comments, follows, reposts)
- `notify(signerId, targetAccountId, item?, type?)` — Send a custom notification

**Poke Method:**
- `poke(signerId, targetAccountId)` — Poke another account

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

## Types

### `Post`
```typescript
interface Post {
  text: string;
  type?: string;  // defaults to 'md'
  image?: {
    ipfs_cid?: string;
    url?: string;
  };
}
```

### `Comment`
```typescript
interface Comment {
  item: CommentItem;
  text: string;
  image?: {
    ipfs_cid?: string;
    url?: string;
  };
}
```

### `CommentItem`
```typescript
interface CommentItem {
  type: string;        // e.g., 'social'
  path: string;        // e.g., 'alice.near/post/main'
  blockHeight: number;
}
```

### `FeedOptions`
```typescript
interface FeedOptions {
  limit?: number;
  from?: number;
  order?: 'asc' | 'desc';
}
```

### `AccountFeedOptions`
```typescript
interface AccountFeedOptions extends FeedOptions {
  includeReplies?: boolean;  // If true, also include comments/replies made by the account
}
```

### `IndexEntry`
```typescript
interface IndexEntry {
  accountId: string;
  blockHeight: number;
  value?: unknown;
}
```

### `Notification`
```typescript
interface Notification {
  accountId: string;
  blockHeight: number;
  value: {
    type: string;  // 'mention', 'like', 'comment', 'follow', 'repost', 'poke', etc.
    item?: CommentItem;
    accountId?: string;
  };
}
```

---

## Utility Functions

### `extractMentions(text)`
Extract @mentions from text and return valid NEAR account IDs.

```typescript
const mentions = extractMentions('Hello @alice.near and @bob.near!');
// ['alice.near', 'bob.near']
```

### `extractHashtags(text)`
Extract #hashtags from text.

```typescript
const hashtags = extractHashtags('Building on #near #blockchain');
// ['near', 'blockchain']
```

### `buildNotifications(mentions, item)`
Build notification index data for mentioned accounts.

```typescript
const notificationData = buildNotifications(
  ['alice.near'],
  { type: 'social', path: 'bob.near/post/main', blockHeight: 12345 }
);
```

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
