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

    it('should store post with proper structure (post/main + index/post)', async () => {
      const txBuilder = await social.createPost(rootAccountId, {
        text: 'Hello',
        type: 'md',
      });
      const txResult = await txBuilder.send();

      expect(txResult.status).not.toHaveProperty('Failure');

      const rawPost = await social.get({
        keys: [`${rootAccountId}/post/main`],
        useApiServer: false,
      });
      const main = (rawPost?.[rootAccountId] as any)?.post?.main;
      expect(typeof main).toBe('string');

      const parsedMain = JSON.parse(main as string);
      expect(parsedMain).toMatchObject({ text: 'Hello', type: 'md' });

      const rawIndex = await social.get({
        keys: [`${rootAccountId}/index/post`],
        useApiServer: false,
      });
      const indexPost = (rawIndex?.[rootAccountId] as any)?.index?.post;
      expect(typeof indexPost).toBe('string');

      const parsedIndex = JSON.parse(indexPost as string);
      expect(parsedIndex).toEqual({ key: 'main', value: { type: 'md' } });
    });

    it('should default post type to "md" when not provided', async () => {
      const txBuilder = await social.createPost(rootAccountId, {
        text: 'Hello without type',
      });
      const txResult = await txBuilder.send();

      expect(txResult.status).not.toHaveProperty('Failure');

      const rawPost = await social.get({
        keys: [`${rootAccountId}/post/main`],
        useApiServer: false,
      });
      const main = (rawPost?.[rootAccountId] as any)?.post?.main;
      expect(typeof main).toBe('string');

      const parsedMain = JSON.parse(main as string);
      expect(parsedMain).toMatchObject({ text: 'Hello without type', type: 'md' });
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
      expect(following).toBeDefined();
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
