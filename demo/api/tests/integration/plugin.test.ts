import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { createPluginRuntime } from 'every-plugin';
import { Near, generateKey, type PrivateKey } from 'near-kit';
import { Social } from 'near-social-js';
import {
  createTestSandbox,
  stopTestSandbox,
  type TestContext,
} from '../../../../test/setup';
import Plugin from '../../src/index';

let ctx: TestContext;
let pluginRuntime: ReturnType<typeof createPluginRuntime>;
let apiAccountId: string;
let apiPrivateKey: string;
let userAccountId: string;
let userNear: Near;
let userSocial: Social;
let sandboxRpcUrl: string;

beforeAll(async () => {
  ctx = await createTestSandbox('social');
  const { near, sandbox, contractId, rootAccountId } = ctx;
  sandboxRpcUrl = sandbox.rpcUrl;

  const apiKey = generateKey();
  apiAccountId = `api.${rootAccountId}`;
  apiPrivateKey = apiKey.secretKey;

  await near
    .transaction(rootAccountId)
    .createAccount(apiAccountId)
    .transfer(apiAccountId, '20 NEAR')
    .addKey(apiKey.publicKey.toString(), { type: 'fullAccess' })
    .send();

  const userKey = generateKey();
  userAccountId = `user.${rootAccountId}`;

  await near
    .transaction(rootAccountId)
    .createAccount(userAccountId)
    .transfer(userAccountId, '10 NEAR')
    .addKey(userKey.publicKey.toString(), { type: 'fullAccess' })
    .send();

  userNear = new Near({
    network: sandbox,
    privateKey: userKey.secretKey as PrivateKey,
    defaultSignerId: userAccountId,
    defaultWaitUntil: 'FINAL',
  });

  userSocial = new Social({
    near: userNear,
    contractId,
    useApiServer: false,
  });

  pluginRuntime = createPluginRuntime({
    registry: {
      api: {
        module: Plugin,
      },
    },
    secrets: {
      API_ACCOUNT_ID: apiAccountId,
      API_PRIVATE_KEY: apiPrivateKey,
    },
  });
}, 120000);

afterAll(async () => {
  if (pluginRuntime) {
    await pluginRuntime.shutdown();
  }
  await stopTestSandbox(ctx);
});

const describeIfNotWin32 = process.platform === 'win32' ? describe.skip : describe;

describeIfNotWin32('API Plugin Integration Tests', () => {
  describe('ping procedure', () => {
    it('should return healthy status', async () => {
      const plugin = await pluginRuntime.usePlugin(
        'api',
        {
          variables: {
            network: 'testnet',
            contractId: ctx.contractId,
            nodeUrl: sandboxRpcUrl,
          },
          secrets: {
            apiAccountId: '{{API_ACCOUNT_ID}}',
            apiPrivateKey: '{{API_PRIVATE_KEY}}',
          },
        }
      );
      const client = plugin.createClient();

      const result = await client.ping();

      expect(result).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
      });
    });
  });

  describe('connect procedure', () => {
    it('should ensure storage deposit for a new account', async () => {
      const plugin = await pluginRuntime.usePlugin(
        'api',
        {
          variables: {
            network: 'testnet',
            contractId: ctx.contractId,
            nodeUrl: sandboxRpcUrl,
          },
          secrets: {
            apiAccountId: '{{API_ACCOUNT_ID}}',
            apiPrivateKey: '{{API_PRIVATE_KEY}}',
          },
        }
      );
      const client = plugin.createClient();

      const result = await client.connect({ accountId: userAccountId });

      expect(result.accountId).toBe(userAccountId);
      expect(typeof result.hasStorage).toBe('boolean');
      if (!result.hasStorage) {
        expect(result.depositTxHash).toBeDefined();
      }
    });
  });

  describe('publish procedure', () => {
    it('should relay a signed delegate action for profile update', async () => {
      const plugin = await pluginRuntime.usePlugin(
        'api',
        {
          variables: {
            network: 'testnet',
            contractId: ctx.contractId,
            nodeUrl: sandboxRpcUrl,
          },
          secrets: {
            apiAccountId: '{{API_ACCOUNT_ID}}',
            apiPrivateKey: '{{API_PRIVATE_KEY}}',
          },
        }
      );
      const client = plugin.createClient();

      await client.connect({ accountId: userAccountId });

      const txBuilder = await userSocial.setProfile(userAccountId, {
        name: 'Relayed User',
        description: 'Profile set via api',
      });

      const { payload } = await txBuilder.delegate();

      const result = await client.publish({ payload });

      expect(result.hash).toBeDefined();
      expect(typeof result.hash).toBe('string');

      const profile = await userSocial.getProfile(userAccountId);
      expect(profile?.name).toBe('Relayed User');
      expect(profile?.description).toBe('Profile set via api');
    });
  });
});
