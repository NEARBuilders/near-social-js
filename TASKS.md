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

---

### 3. Post Structure Enhancement
**Description**: Update `Post` interface and `createPost` method to match NEAR Social's expected structure.

**Current Issue**: Posts should have `type` field (default "md") in the main content.

**Acceptance Criteria**:
- [x] `Post` interface includes `text`, `type` (optional, defaults to "md"), and `image` (optional)
- [x] `createPost` stores `{ text, type }` in `post/main` (JSON stringified)
- [x] `createPost` indexes to `index/post` with key "main" and value `{ type: "md" }`

**Test**:
```typescript
it('should create a post with proper structure', async () => {
  const tx = await social.createPost(signerId, { text: 'Hello', type: 'md' });
  await tx.send();
  // Verify stored data matches expected structure
});
```

---

## In Progress 🔄

### 2. Social Class Methods
Current methods implemented in `src/social.ts`:
- [x] `getProfile(accountId)`
- [x] `setProfile(signerId, profile)`
- [x] `getPost(accountId, blockHeight)`
- [x] `createPost(signerId, post)`
- [x] `getFollowers(accountId)`
- [x] `getFollowing(accountId)`
- [x] `follow(signerId, accountId)`
- [x] `unfollow(signerId, accountId)`
- [x] `like(signerId, item)`
- [x] `getLikes(item)`

---

## TODO 📋

### 4. Comments Feature
**Description**: Add ability to create and retrieve comments on posts.

**Acceptance Criteria**:
- [ ] `createComment(signerId, { item, text, image? })` method exists
- [ ] Comment stored at `{signerId}/post/comment` as JSON with `{ item, text, type }`
- [ ] Comment indexed at `index/comment` with key = `item`, value = `{ type: "md" }`
- [ ] `getComments(item)` returns array of comments for a post item

**Data Structure**:
```typescript
// item format
{ type: "social", path: "alice.near/post/main", blockHeight: 12345 }

// stored data
{
  post: { comment: JSON.stringify({ item, text, type: "md" }) },
  index: { comment: JSON.stringify({ key: item, value: { type: "md" } }) }
}
```

**Tests**:
- [ ] Can create a comment on a post
- [ ] Can retrieve comments for a post item
- [ ] Comment data structure matches expected format

---

### 5. Repost Feature
**Description**: Add ability to repost content to your feed.

**Acceptance Criteria**:
- [ ] `repost(signerId, item)` method exists
- [ ] Repost indexed at `index/repost` with key = "main", value = `{ type: "repost", item }`
- [ ] `getReposts(item)` returns accounts that reposted an item

**Data Structure**:
```typescript
{
  index: {
    repost: JSON.stringify([
      { key: "main", value: { type: "repost", item } },
      { key: item, value: { type: "repost" } }
    ])
  }
}
```

**Tests**:
- [ ] Can repost an item
- [ ] Can retrieve reposts for an item

---

### 6. Unlike Feature
**Description**: Add explicit unlike functionality.

**Acceptance Criteria**:
- [ ] `unlike(signerId, item)` method exists OR `like` method is updated to toggle
- [ ] Unlike indexed at `index/like` with `{ type: "unlike" }`

**Test**:
- [ ] Can unlike a previously liked item

---

### 7. Test Suite (`test/social.test.ts`)
**Description**: Create comprehensive tests for Social class.

**Acceptance Criteria**:
- [ ] Tests for `getProfile` / `setProfile`
- [ ] Tests for `createPost` / `getPost`
- [ ] Tests for `follow` / `unfollow` / `getFollowing` / `getFollowers`
- [ ] Tests for `like` / `getLikes`
- [ ] Tests verify data structures match contract expectations

---

## Future Enhancements 🚀

### 10. Mention/Hashtag Extraction Utilities
**Description**: Helper functions to parse mentions and hashtags from text.

**Scope**:
- [ ] `extractMentions(text)` → returns `string[]` of account IDs
- [ ] `extractHashtags(text)` → returns `string[]` of hashtags
- [ ] `buildNotifications(mentions, item)` → builds notification index data

---
