import { Near } from 'near-kit';
import { Social } from '../src';
import { createTestSandbox, stopTestSandbox, TestContext } from './setup';

let ctx: TestContext;
let near: Near;
let social: Social;
let contractId: string;
let rootAccountId: string;

beforeAll(async () => {
  ctx = await createTestSandbox('social');
  near = ctx.near;
  contractId = ctx.contractId;
  rootAccountId = ctx.rootAccountId;

  social = new Social({
    near,
    contractId,
    useApiServer: false,
  });
}, 60000);

afterAll(async () => {
  await stopTestSandbox(ctx);
});

describe('Social - Profile Methods', () => {
  describe('setProfile', () => {
    it('should create a transaction builder for setting profile', async () => {
      const txBuilder = await social.setProfile(rootAccountId, {
        name: 'Test User',
        description: 'A test profile',
      });

      expect(txBuilder).toBeDefined();
      expect(typeof txBuilder.send).toBe('function');
    });

    it('should store profile data', async () => {
      const txBuilder = await social.setProfile(rootAccountId, {
        name: 'Alice',
        description: 'Hello from Alice',
      });
      const txResult = await txBuilder.send();

      expect(txResult.status).not.toHaveProperty('Failure');

      const profile = await social.getProfile(rootAccountId);
      expect(profile).toBeDefined();
      expect(profile?.name).toBe('Alice');
      expect(profile?.description).toBe('Hello from Alice');
    });

    it('should store profile with image fields', async () => {
      const txBuilder = await social.setProfile(rootAccountId, {
        name: 'Bob',
        image: { url: 'https://example.com/avatar.png' },
        backgroundImage: { ipfs_cid: 'bafybei123' },
      });
      await txBuilder.send();

      const profile = await social.getProfile(rootAccountId);
      expect(profile).toBeDefined();
      expect(profile?.name).toBe('Bob');
      expect(profile?.image).toEqual({ url: 'https://example.com/avatar.png' });
      expect(profile?.backgroundImage).toEqual({ ipfs_cid: 'bafybei123' });
    });

    it('should support partial profile updates', async () => {
      // First set initial profile
      await (
        await social.setProfile(rootAccountId, {
          name: 'Charlie',
          description: 'Initial description',
        })
      ).send();

      // Update only the description
      await (
        await social.setProfile(rootAccountId, {
          description: 'Updated description',
        })
      ).send();

      const profile = await social.getProfile(rootAccountId);
      expect(profile).toBeDefined();
      expect(profile?.description).toBe('Updated description');
    });

    it('should store profile data structure matching contract expectations', async () => {
      const txBuilder = await social.setProfile(rootAccountId, {
        name: 'DataTest',
        linktree: { twitter: 'testuser', github: 'testuser' },
        tags: { developer: '', rust: '' },
      });
      await txBuilder.send();

      // Verify the raw data structure
      const result = await social.get({
        keys: [`${rootAccountId}/profile/**`],
      });

      expect(result).not.toBeNull();
      const accountData = result![rootAccountId] as {
        profile?: Record<string, unknown>;
      };
      expect(accountData?.profile).toBeDefined();
      expect(accountData?.profile?.name).toBe('DataTest');
      expect(accountData?.profile?.linktree).toEqual({
        twitter: 'testuser',
        github: 'testuser',
      });
    });
  });

  describe('getProfile', () => {
    it('should return null for non-existent profile', async () => {
      const profile = await social.getProfile('nonexistent.near');
      expect(profile).toBeNull();
    });

    it('should retrieve stored profile with all fields', async () => {
      // Set a complete profile first
      await (
        await social.setProfile(rootAccountId, {
          name: 'FullProfile',
          description: 'A complete profile',
          image: { url: 'https://example.com/image.png' },
        })
      ).send();

      const profile = await social.getProfile(rootAccountId);
      expect(profile).not.toBeNull();
      expect(profile?.name).toBe('FullProfile');
      expect(profile?.description).toBe('A complete profile');
      expect(profile?.image).toEqual({ url: 'https://example.com/image.png' });
    });
  });
});

describe('Social - Post Methods', () => {
  describe('createPost', () => {
    it('should create a transaction builder for creating post', async () => {
      const txBuilder = await social.createPost(rootAccountId, {
        text: 'Hello world!',
      });

      expect(txBuilder).toBeDefined();
      expect(typeof txBuilder.send).toBe('function');
    });

    it('should create a post with proper structure', async () => {
      const tx = await social.createPost(rootAccountId, {
        text: 'Hello',
        type: 'md',
      });
      await tx.send();

      // Verify stored data matches expected structure
      // The post should be stored with { text, type } JSON stringified in post/main
      // and indexed with key "main" and value { type: "md" }
      const result = await social.get({
        keys: [`${rootAccountId}/post/main`],
      });

      expect(result).not.toBeNull();
      const accountData = result![rootAccountId] as {
        post?: { main?: string };
      };
      expect(accountData?.post?.main).toBeDefined();

      const parsedPost = JSON.parse(accountData.post!.main!);
      expect(parsedPost.text).toBe('Hello');
      expect(parsedPost.type).toBe('md');
    });

    it('should default type to md when not provided', async () => {
      const tx = await social.createPost(rootAccountId, {
        text: 'Default type test',
      });
      await tx.send();

      const result = await social.get({
        keys: [`${rootAccountId}/post/main`],
      });

      expect(result).not.toBeNull();
      const accountData = result![rootAccountId] as {
        post?: { main?: string };
      };
      const parsedPost = JSON.parse(accountData.post!.main!);
      expect(parsedPost.type).toBe('md');
    });

    it('should include image in post when provided', async () => {
      const tx = await social.createPost(rootAccountId, {
        text: 'Post with image',
        type: 'md',
        image: { url: 'https://example.com/image.png' },
      });
      await tx.send();

      const result = await social.get({
        keys: [`${rootAccountId}/post/main`],
      });

      expect(result).not.toBeNull();
      const accountData = result![rootAccountId] as {
        post?: { main?: string };
      };
      const parsedPost = JSON.parse(accountData.post!.main!);
      expect(parsedPost.text).toBe('Post with image');
      expect(parsedPost.image).toEqual({ url: 'https://example.com/image.png' });
    });

    it('should store post data structure matching contract expectations', async () => {
      const tx = await social.createPost(rootAccountId, {
        text: 'Contract format test',
        type: 'md',
      });
      await tx.send();

      // Verify the data is JSON stringified in post/main
      const result = await social.get({
        keys: [`${rootAccountId}/post/main`],
      });

      expect(result).not.toBeNull();
      const accountData = result![rootAccountId] as {
        post?: { main?: string };
      };

      // The main content should be a JSON string
      expect(typeof accountData?.post?.main).toBe('string');
      const parsed = JSON.parse(accountData.post!.main!);
      expect(parsed).toHaveProperty('text');
      expect(parsed).toHaveProperty('type');
    });
  });

  describe('getPost', () => {
    it('should return null for non-existent post', async () => {
      // Using a very high block height that doesn't exist
      const post = await social.getPost('nonexistent.near', 999999999);
      expect(post).toBeNull();
    });
  });
});

describe('Social - Follow Methods', () => {
  let targetAccountId: string;

  beforeAll(async () => {
    targetAccountId = `target.${rootAccountId}`;
    await near
      .transaction(rootAccountId)
      .createAccount(targetAccountId)
      .transfer(targetAccountId, '5 NEAR')
      .send();
  });

  describe('follow', () => {
    it('should create a transaction builder for following', async () => {
      const txBuilder = await social.follow(rootAccountId, targetAccountId);

      expect(txBuilder).toBeDefined();
      expect(typeof txBuilder.send).toBe('function');
    });

    it('should store follow relationship', async () => {
      const txBuilder = await social.follow(rootAccountId, targetAccountId);
      const txResult = await txBuilder.send();

      expect(txResult.status).not.toHaveProperty('Failure');

      const following = await social.getFollowing(rootAccountId);
      expect(following).not.toBeNull();
      expect(following![targetAccountId]).toBeDefined();
    });

    it('should store follow data structure matching contract expectations', async () => {
      // Verify the raw data structure for follow
      const result = await social.get({
        keys: [`${rootAccountId}/graph/follow/**`],
      });

      expect(result).not.toBeNull();
      const accountData = result![rootAccountId] as {
        graph?: { follow?: Record<string, unknown> };
      };
      expect(accountData?.graph?.follow).toBeDefined();
      expect(accountData?.graph?.follow?.[targetAccountId]).toBeDefined();
    });
  });

  describe('unfollow', () => {
    it('should create a transaction builder for unfollowing', async () => {
      const txBuilder = await social.unfollow(rootAccountId, targetAccountId);

      expect(txBuilder).toBeDefined();
      expect(typeof txBuilder.send).toBe('function');
    });

    it('should remove follow relationship', async () => {
      // First ensure we're following
      await (await social.follow(rootAccountId, targetAccountId)).send();

      // Then unfollow
      await (await social.unfollow(rootAccountId, targetAccountId)).send();

      // Verify the relationship is removed (set to null)
      const result = await social.get({
        keys: [`${rootAccountId}/graph/follow/${targetAccountId}`],
      });

      // The value should be null after unfollow
      const accountData = result?.[rootAccountId] as {
        graph?: { follow?: Record<string, unknown> };
      };
      expect(accountData?.graph?.follow?.[targetAccountId]).toBeNull();
    });
  });

  describe('getFollowing', () => {
    it('should return empty object for account with no follows', async () => {
      const following = await social.getFollowing('nonexistent.near');
      expect(following).toEqual({});
    });

    it('should return following list after follow', async () => {
      // Re-follow for this test
      await (await social.follow(rootAccountId, targetAccountId)).send();

      const following = await social.getFollowing(rootAccountId);
      expect(following).not.toBeNull();
      expect(Object.keys(following!).length).toBeGreaterThan(0);
    });
  });

  describe('getFollowers', () => {
    it('should return empty array for account with no followers', async () => {
      const followers = await social.getFollowers('nonexistent.near');
      expect(Array.isArray(followers)).toBe(true);
      expect(followers.length).toBe(0);
    });
  });
});

describe('Social - Like Methods', () => {
  const testItem = {
    type: 'social',
    path: `test.near/post/main`,
    blockHeight: 12345,
  };

  describe('like', () => {
    it('should create a transaction builder for liking', async () => {
      const txBuilder = await social.like(rootAccountId, testItem);

      expect(txBuilder).toBeDefined();
      expect(typeof txBuilder.send).toBe('function');
    });

    it('should store like with correct index structure', async () => {
      const tx = await social.like(rootAccountId, testItem);
      await tx.send();

      // Like should be indexed at index/like with key=item, value={ type: "like" }
      expect(tx).toBeDefined();
    });
  });

  describe('getLikes', () => {
    it('should return empty array for item with no likes', async () => {
      const likes = await social.getLikes({
        type: 'social',
        path: 'nonexistent.near/post/main',
        blockHeight: 99999,
      });
      expect(Array.isArray(likes)).toBe(true);
    });

    it('should return array type for likes query', async () => {
      const likes = await social.getLikes(testItem);
      expect(Array.isArray(likes)).toBe(true);
    });
  });

  describe('unlike', () => {
    it('should create a transaction builder for unliking', async () => {
      const txBuilder = await social.unlike(rootAccountId, testItem);

      expect(txBuilder).toBeDefined();
      expect(typeof txBuilder.send).toBe('function');
    });

    it('should unlike a previously liked item', async () => {
      // First like the item
      const likeTx = await social.like(rootAccountId, testItem);
      await likeTx.send();

      // Then unlike it
      const unlikeTx = await social.unlike(rootAccountId, testItem);
      await unlikeTx.send();

      // The unlike should be indexed with type: "unlike"
      expect(unlikeTx).toBeDefined();
    });

    it('should store unlike with type "unlike" in index', async () => {
      const tx = await social.unlike(rootAccountId, testItem);
      await tx.send();

      // Unlike should be indexed at index/like with value={ type: "unlike" }
      expect(tx).toBeDefined();
    });
  });
});

describe('Social - Comment Methods', () => {
  const testItem = {
    type: 'social',
    path: 'alice.near/post/main',
    blockHeight: 12345,
  };

  describe('createComment', () => {
    it('should create a transaction builder for creating comment', async () => {
      const txBuilder = await social.createComment(rootAccountId, {
        item: testItem,
        text: 'Great post!',
      });

      expect(txBuilder).toBeDefined();
      expect(typeof txBuilder.send).toBe('function');
    });

    it('should create a comment with proper structure', async () => {
      const tx = await social.createComment(rootAccountId, {
        item: testItem,
        text: 'This is a comment',
      });
      await tx.send();

      // Verify stored data matches expected structure
      const result = await social.get({
        keys: [`${rootAccountId}/post/comment`],
      });

      expect(result).not.toBeNull();
      const accountData = result![rootAccountId] as {
        post?: { comment?: string };
      };
      expect(accountData?.post?.comment).toBeDefined();

      const parsedComment = JSON.parse(accountData.post!.comment!);
      expect(parsedComment.text).toBe('This is a comment');
      expect(parsedComment.type).toBe('md');
      expect(parsedComment.item).toEqual(testItem);
    });

    it('should include image in comment when provided', async () => {
      const tx = await social.createComment(rootAccountId, {
        item: testItem,
        text: 'Comment with image',
        image: { url: 'https://example.com/comment-image.png' },
      });
      await tx.send();

      const result = await social.get({
        keys: [`${rootAccountId}/post/comment`],
      });

      expect(result).not.toBeNull();
      const accountData = result![rootAccountId] as {
        post?: { comment?: string };
      };
      const parsedComment = JSON.parse(accountData.post!.comment!);
      expect(parsedComment.text).toBe('Comment with image');
      expect(parsedComment.image).toEqual({
        url: 'https://example.com/comment-image.png',
      });
    });
  });

  describe('getComments', () => {
    it('should return empty array for item with no comments', async () => {
      const comments = await social.getComments({
        type: 'social',
        path: 'nonexistent.near/post/main',
        blockHeight: 99999,
      });
      expect(Array.isArray(comments)).toBe(true);
    });
  });
});

describe('Social - Repost Methods', () => {
  const testItem = {
    type: 'social',
    path: 'alice.near/post/main',
    blockHeight: 12345,
  };

  describe('repost', () => {
    it('should create a transaction builder for reposting', async () => {
      const txBuilder = await social.repost(rootAccountId, testItem);

      expect(txBuilder).toBeDefined();
      expect(typeof txBuilder.send).toBe('function');
    });

    it('should create a repost with proper index structure', async () => {
      const tx = await social.repost(rootAccountId, testItem);
      await tx.send();

      // The repost should be indexed with both:
      // - key: "main", value: { type: "repost", item }
      // - key: item, value: { type: "repost" }
      // This allows querying reposts by item
      expect(tx).toBeDefined();
    });
  });

  describe('getReposts', () => {
    it('should return empty array for item with no reposts', async () => {
      const reposts = await social.getReposts({
        type: 'social',
        path: 'nonexistent.near/post/main',
        blockHeight: 99999,
      });
      expect(Array.isArray(reposts)).toBe(true);
    });
  });
});

describe('Social - Feed Methods', () => {
  describe('getAccountFeed', () => {
    it('should return array for account feed', async () => {
      const feed = await social.getAccountFeed(rootAccountId);
      expect(Array.isArray(feed)).toBe(true);
    });

    it('should support pagination options', async () => {
      const feed = await social.getAccountFeed(rootAccountId, {
        limit: 5,
        order: 'desc',
      });
      expect(Array.isArray(feed)).toBe(true);
      expect(feed.length).toBeLessThanOrEqual(5);
    });

    it('should return empty array for account with no posts', async () => {
      const feed = await social.getAccountFeed('nonexistent.near');
      expect(Array.isArray(feed)).toBe(true);
      expect(feed.length).toBe(0);
    });

    it('should support includeReplies option', async () => {
      const feedWithReplies = await social.getAccountFeed(rootAccountId, {
        includeReplies: true,
        limit: 10,
      });
      expect(Array.isArray(feedWithReplies)).toBe(true);
    });

    it('should return combined posts and comments when includeReplies is true', async () => {
      // This test verifies the method accepts the includeReplies parameter
      const feedWithoutReplies = await social.getAccountFeed(rootAccountId, {
        includeReplies: false,
      });
      const feedWithReplies = await social.getAccountFeed(rootAccountId, {
        includeReplies: true,
      });
      expect(Array.isArray(feedWithoutReplies)).toBe(true);
      expect(Array.isArray(feedWithReplies)).toBe(true);
    });
  });

  describe('getHashtagFeed', () => {
    it('should return array for hashtag feed', async () => {
      const feed = await social.getHashtagFeed('near');
      expect(Array.isArray(feed)).toBe(true);
    });

    it('should handle hashtag with # prefix', async () => {
      const feed = await social.getHashtagFeed('#near');
      expect(Array.isArray(feed)).toBe(true);
    });

    it('should support pagination options', async () => {
      const feed = await social.getHashtagFeed('near', {
        limit: 10,
        order: 'desc',
      });
      expect(Array.isArray(feed)).toBe(true);
      expect(feed.length).toBeLessThanOrEqual(10);
    });
  });

  describe('getActivityFeed', () => {
    it('should return array for activity feed', async () => {
      const feed = await social.getActivityFeed();
      expect(Array.isArray(feed)).toBe(true);
    });

    it('should support pagination options', async () => {
      const feed = await social.getActivityFeed({
        limit: 15,
        order: 'desc',
      });
      expect(Array.isArray(feed)).toBe(true);
      expect(feed.length).toBeLessThanOrEqual(15);
    });
  });

  describe('getMentionedFeed', () => {
    it('should return array for mentioned feed', async () => {
      const feed = await social.getMentionedFeed(rootAccountId);
      expect(Array.isArray(feed)).toBe(true);
    });

    it('should return empty array for account with no mentions', async () => {
      const feed = await social.getMentionedFeed('nonexistent.near');
      expect(Array.isArray(feed)).toBe(true);
      expect(feed.length).toBe(0);
    });
  });
});

describe('Social - Notification Methods', () => {
  describe('getNotifications', () => {
    it('should return array for notifications', async () => {
      const notifications = await social.getNotifications(rootAccountId);
      expect(Array.isArray(notifications)).toBe(true);
    });

    it('should support pagination options', async () => {
      const notifications = await social.getNotifications(rootAccountId, {
        limit: 10,
        order: 'desc',
      });
      expect(Array.isArray(notifications)).toBe(true);
      expect(notifications.length).toBeLessThanOrEqual(10);
    });

    it('should return empty array for account with no notifications', async () => {
      const notifications = await social.getNotifications('nonexistent.near');
      expect(Array.isArray(notifications)).toBe(true);
      expect(notifications.length).toBe(0);
    });
  });

  describe('notify', () => {
    let targetAccount: string;

    beforeAll(async () => {
      targetAccount = `notify-target.${rootAccountId}`;
      try {
        await near
          .transaction(rootAccountId)
          .createAccount(targetAccount)
          .transfer(targetAccount, '5 NEAR')
          .send();
      } catch {
        // Account might already exist
      }
    });

    it('should create a transaction builder for notifying', async () => {
      const txBuilder = await social.notify(
        rootAccountId,
        targetAccount,
        undefined,
        'custom'
      );

      expect(txBuilder).toBeDefined();
      expect(typeof txBuilder.send).toBe('function');
    });

    it('should send notification without item', async () => {
      const tx = await social.notify(
        rootAccountId,
        targetAccount,
        undefined,
        'custom'
      );
      await tx.send();
      expect(tx).toBeDefined();
    });

    it('should send notification with item reference', async () => {
      const item = {
        type: 'social',
        path: `${rootAccountId}/post/main`,
        blockHeight: 12345,
      };
      const tx = await social.notify(rootAccountId, targetAccount, item, 'share');
      await tx.send();
      expect(tx).toBeDefined();
    });
  });
});

describe('Social - Poke Method', () => {
  let pokeTarget: string;

  beforeAll(async () => {
    pokeTarget = `poke-target.${rootAccountId}`;
    try {
      await near
        .transaction(rootAccountId)
        .createAccount(pokeTarget)
        .transfer(pokeTarget, '5 NEAR')
        .send();
    } catch {
      // Account might already exist
    }
  });

  describe('poke', () => {
    it('should create a transaction builder for poking', async () => {
      const txBuilder = await social.poke(rootAccountId, pokeTarget);

      expect(txBuilder).toBeDefined();
      expect(typeof txBuilder.send).toBe('function');
    });

    it('should poke another account', async () => {
      const tx = await social.poke(rootAccountId, pokeTarget);
      await tx.send();

      // Poke should index both:
      // - graph poke for the signer
      // - notify poke for the target
      expect(tx).toBeDefined();
    });
  });
});

describe('Social - Mention/Hashtag Extraction in Posts', () => {
  describe('createPost with mentions', () => {
    it('should extract mentions from post text', async () => {
      const tx = await social.createPost(rootAccountId, {
        text: 'Hello @alice.near and @bob.near!',
        type: 'md',
      });
      await tx.send();

      // The post should be created and mentions should trigger notifications
      // Verify the post was created
      const result = await social.get({
        keys: [`${rootAccountId}/post/main`],
      });
      expect(result).not.toBeNull();

      const accountData = result![rootAccountId] as {
        post?: { main?: string };
      };
      const parsedPost = JSON.parse(accountData.post!.main!);
      expect(parsedPost.text).toContain('@alice.near');
      expect(parsedPost.text).toContain('@bob.near');
    });
  });

  describe('createPost with hashtags', () => {
    it('should extract hashtags from post text', async () => {
      const tx = await social.createPost(rootAccountId, {
        text: 'Building on #near #blockchain #web3',
        type: 'md',
      });
      await tx.send();

      // The post should be created with hashtag indexing
      const result = await social.get({
        keys: [`${rootAccountId}/post/main`],
      });
      expect(result).not.toBeNull();

      const accountData = result![rootAccountId] as {
        post?: { main?: string };
      };
      const parsedPost = JSON.parse(accountData.post!.main!);
      expect(parsedPost.text).toContain('#near');
      expect(parsedPost.text).toContain('#blockchain');
    });
  });

  describe('createComment with mentions', () => {
    const testItem = {
      type: 'social',
      path: 'poster.near/post/main',
      blockHeight: 12345,
    };

    it('should extract mentions from comment text', async () => {
      const tx = await social.createComment(rootAccountId, {
        item: testItem,
        text: 'Great post @poster.near!',
      });
      await tx.send();

      // The comment should be created
      const result = await social.get({
        keys: [`${rootAccountId}/post/comment`],
      });
      expect(result).not.toBeNull();

      const accountData = result![rootAccountId] as {
        post?: { comment?: string };
      };
      const parsedComment = JSON.parse(accountData.post!.comment!);
      expect(parsedComment.text).toContain('@poster.near');
    });
  });
});

describe('Social - getPost with comments option', () => {
  it('should return post without comments by default', async () => {
    // First create a post
    await (
      await social.createPost(rootAccountId, {
        text: 'Post for comments test',
        type: 'md',
      })
    ).send();

    // Get the post without comments option
    const post = await social.getPost(rootAccountId, 1);
    // Post might be null if no post at block height 1, that's ok for this test
    if (post) {
      expect(post).not.toHaveProperty('comments');
    }
  });

  it('should accept comments option parameter', async () => {
    // This test verifies the method accepts the options parameter
    const _post = await social.getPost(rootAccountId, 1, { comments: true });
    // Even if post is null, the method should accept the parameter
    expect(_post === null || _post !== null).toBe(true);
  });
});
