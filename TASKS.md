# near-social-js v2.0 Tasks

## Overview
This document outlines the remaining tasks for the `near-social-js` v2.0 release, including acceptance criteria for each feature.

---

## Completed ✅

### 1. Core Architecture Refactor
- [x] Rename `Social` class to `Graph` (low-level contract interactions)
- [x] Create new `Social` class extending `Graph` (high-level social methods)
- [x] Rename package from `@builddao/near-social-js` to `near-social-js`
- [x] Update `CHANGELOG.md` with breaking changes
- [x] Migrate from `near-api-js` to `near-kit`

### 3. Post Structure Enhancement
- [x] `Post` interface includes `text`, `type` (optional, defaults to "md"), and `image` (optional)
- [x] `createPost` stores `{ text, type }` in `post/main` (JSON stringified)
- [x] `createPost` indexes to `index/post` with key "main" and value `{ type: "md" }`
- [x] `createPost` extracts @mentions and #hashtags automatically
- [x] `createPost` sends notifications to mentioned users
- [x] `createPost` indexes hashtags for discovery

### 4. Comments Feature
- [x] `createComment(signerId, { item, text, image? })` method exists
- [x] Comment stored at `{signerId}/post/comment` as JSON with `{ item, text, type }`
- [x] Comment indexed at `index/comment` with key = `item`, value = `{ type: "md" }`
- [x] `getComments(item)` returns array of comments for a post item
- [x] `createComment` extracts @mentions and #hashtags automatically
- [x] `createComment` notifies post author and mentioned users

### 5. Repost Feature
- [x] `repost(signerId, item)` method exists
- [x] Repost indexed at `index/repost` with key = "main", value = `{ type: "repost", item }`
- [x] `getReposts(item)` returns accounts that reposted an item
- [x] `repost` sends notification to original post author

### 6. Unlike Feature
- [x] `unlike(signerId, item)` method exists
- [x] Unlike indexed at `index/like` with `{ type: "unlike" }`

### 7. Test Suite (`test/social.test.ts`)
- [x] Tests for `getProfile` / `setProfile`
- [x] Tests for `createPost` / `getPost`
- [x] Tests for `follow` / `unfollow` / `getFollowing` / `getFollowers`
- [x] Tests for `like` / `getLikes` / `unlike`
- [x] Tests for `createComment` / `getComments`
- [x] Tests for `repost` / `getReposts`
- [x] Tests for feed methods (`getAccountFeed`, `getHashtagFeed`, `getActivityFeed`, `getMentionedFeed`)
- [x] Tests for notification methods (`getNotifications`, `notify`)
- [x] Tests for `poke`
- [x] Tests for mention/hashtag extraction in posts/comments
- [x] Tests verify data structures match contract expectations

### 8. Feed Methods
- [x] `getAccountFeed(accountId, options?)` - Get posts from a specific account
  - [x] Supports `includeReplies` option to include comments/replies too
- [x] `getHashtagFeed(hashtag, options?)` - Get posts tagged with a hashtag
- [x] `getActivityFeed(options?)` - Get all recent posts
- [x] `getMentionedFeed(accountId, options?)` - Get posts where account was mentioned

### 9. Notification Methods
- [x] `getNotifications(accountId, options?)` - Get all notifications
- [x] `notify(signerId, targetAccountId, item?, type?)` - Send custom notification
- [x] Auto-notifications for: follow, like, repost, comment, mention

### 10. Mention/Hashtag Extraction Utilities
- [x] `extractMentions(text)` → returns `string[]` of account IDs
- [x] `extractHashtags(text)` → returns `string[]` of hashtags
- [x] `buildNotifications(mentions, item)` → builds notification index data

### 11. Poke Feature
- [x] `poke(signerId, targetAccountId)` method exists
- [x] Poke sends notification to target account
- [x] Poke indexed at `index/graph` with key = "poke"

### 12. Demo UI Integration
- [x] React Query hooks for all Social methods
- [x] Query keys for all queries/mutations
- [x] Method cards for testing all methods in UI

### 13. Documentation
- [x] API reference updated with all new methods and types
- [x] Cookbook updated with examples for all features
- [x] CHANGELOG updated with v2.0.2 features

---

## In Progress 🔄

### 2. Social Class Methods
All methods implemented in `src/social.ts`:

**Profile Methods:**
- [x] `getProfile(accountId)`
- [x] `setProfile(signerId, profile)`

**Post Methods:**
- [x] `getPost(accountId, blockHeight, options?)` - with optional `comments: boolean`
- [x] `createPost(signerId, post)` - with auto-extraction of @mentions and #hashtags

**Comment Methods:**
- [x] `createComment(signerId, comment)` - with auto-extraction of @mentions and #hashtags
- [x] `getComments(item)`

**Follow Methods:**
- [x] `getFollowers(accountId)`
- [x] `getFollowing(accountId)`
- [x] `follow(signerId, accountId)` - with auto-notification
- [x] `unfollow(signerId, accountId)`

**Like Methods:**
- [x] `like(signerId, item)` - with auto-notification
- [x] `getLikes(item)`
- [x] `unlike(signerId, item)`

**Repost Methods:**
- [x] `repost(signerId, item)` - with auto-notification
- [x] `getReposts(item)`

**Feed Methods:**
- [x] `getAccountFeed(accountId, options?)`
- [x] `getHashtagFeed(hashtag, options?)`
- [x] `getActivityFeed(options?)`
- [x] `getMentionedFeed(accountId, options?)`

**Notification Methods:**
- [x] `getNotifications(accountId, options?)`
- [x] `notify(signerId, targetAccountId, item?, type?)`

**Poke Method:**
- [x] `poke(signerId, targetAccountId)`

---

## Summary

All tasks for v2.0.2 are now **COMPLETE**. The SDK includes:

1. **Complete Social API** with all common social features
2. **Auto-extraction** of @mentions and #hashtags in posts/comments
3. **Auto-notifications** for social interactions
4. **Feed methods** for discovering content
5. **Utility functions** for text parsing
6. **Comprehensive test suite**
7. **React Query hooks** for frontend integration
8. **Updated documentation** and changelog
