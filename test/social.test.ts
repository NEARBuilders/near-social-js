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
      await txBuilder.send();

      const profile = await social.getProfile(rootAccountId);
      expect(profile).toBeDefined();
      expect(profile?.name).toBe('Alice');
      expect(profile?.description).toBe('Hello from Alice');
    });
  });

  describe('getProfile', () => {
    it('should return null for non-existent profile', async () => {
      const profile = await social.getProfile('nonexistent.near');
      expect(profile).toBeNull();
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
      await txBuilder.send();

      const following = await social.getFollowing(rootAccountId);
      expect(following).not.toBeNull();
      expect(following![targetAccountId]).toBeDefined();
    });
  });

  describe('unfollow', () => {
    it('should create a transaction builder for unfollowing', async () => {
      const txBuilder = await social.unfollow(rootAccountId, targetAccountId);

      expect(txBuilder).toBeDefined();
      expect(typeof txBuilder.send).toBe('function');
    });
  });

  describe('getFollowing', () => {
    it('should return empty object for account with no follows', async () => {
      const following = await social.getFollowing('nonexistent.near');
      expect(following).toEqual({});
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
