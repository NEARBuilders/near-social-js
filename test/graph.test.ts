import { Near } from 'near-kit';
import { Graph } from '../src';
import { createTestSandbox, stopTestSandbox, TestContext } from './setup';

let ctx: TestContext;
let near: Near;
let graph: Graph;
let contractId: string;
let rootAccountId: string;

beforeAll(async () => {
  ctx = await createTestSandbox('graph');
  near = ctx.near;
  contractId = ctx.contractId;
  rootAccountId = ctx.rootAccountId;

  graph = new Graph({
    near,
    contractId,
  });
}, 60000);

afterAll(async () => {
  await stopTestSandbox(ctx);
});

describe('Graph - View Methods', () => {
  describe('getVersion', () => {
    it('should return the contract version', async () => {
      const version = await graph.getVersion();
      expect(typeof version).toBe('string');
      expect(version.length).toBeGreaterThan(0);
    });
  });

  describe('getAccountCount', () => {
    it('should return the number of accounts', async () => {
      const count = await graph.getAccountCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getAccounts', () => {
    it('should return accounts list', async () => {
      const accounts = await graph.getAccounts();
      expect(typeof accounts).toBe('object');
    });

    it('should support pagination', async () => {
      const accounts = await graph.getAccounts({ fromIndex: 0, limit: 10 });
      expect(typeof accounts).toBe('object');
    });
  });

  describe('getAccount', () => {
    it('should return null for non-existent account', async () => {
      const account = await graph.getAccount({
        accountId: 'nonexistent.near',
      });
      expect(account).toBeNull();
    });
  });

  describe('getNodeCount', () => {
    it('should return the number of nodes', async () => {
      const count = await graph.getNodeCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getNodes', () => {
    it('should return nodes list', async () => {
      const nodes = await graph.getNodes();
      expect(typeof nodes).toBe('object');
    });
  });

  describe('storageBalanceOf', () => {
    it('should return null for account without storage', async () => {
      const balance = await graph.storageBalanceOf('nonexistent.near');
      expect(balance).toBeNull();
    });
  });

  describe('isWritePermissionGranted', () => {
    it('should return true when account owns the key', async () => {
      const hasPermission = await graph.isWritePermissionGranted({
        key: `${rootAccountId}/profile/name`,
        granteeAccountId: rootAccountId,
      });
      expect(hasPermission).toBe(true);
    });

    it('should return false for non-owner without permission', async () => {
      const hasPermission = await graph.isWritePermissionGranted({
        key: `${rootAccountId}/profile/name`,
        granteeAccountId: 'other.near',
      });
      expect(hasPermission).toBe(false);
    });
  });
});

describe('Graph - Transaction Methods', () => {
  describe('storageDeposit', () => {
    it('should create a transaction builder for storage deposit', async () => {
      const txBuilder = await graph.storageDeposit({
        signerId: rootAccountId,
        deposit: '1000000000000000000000000',
      });

      expect(txBuilder).toBeDefined();
      expect(typeof txBuilder.send).toBe('function');
    });

    it('should deposit storage and be retrievable', async () => {
      const txBuilder = await graph.storageDeposit({
        signerId: rootAccountId,
        deposit: '1000000000000000000000000',
      });
      await txBuilder.send();

      const balance = await graph.storageBalanceOf(rootAccountId);
      expect(balance).not.toBeNull();
      expect(balance?.total).toBeDefined();
    });
  });

  describe('set', () => {
    it('should create a transaction builder for setting data', async () => {
      await graph
        .storageDeposit({
          signerId: rootAccountId,
          deposit: '1000000000000000000000000',
        })
        .then((tx) => tx.send());

      const txBuilder = await graph.set({
        signerId: rootAccountId,
        data: {
          [rootAccountId]: {
            profile: {
              name: 'Test User',
            },
          },
        },
      });

      expect(txBuilder).toBeDefined();
      expect(typeof txBuilder.send).toBe('function');
    });

    it('should store data and retrieve it', async () => {
      const txBuilder = await graph.set({
        signerId: rootAccountId,
        data: {
          [rootAccountId]: {
            profile: {
              name: 'Test User',
              bio: 'Hello World',
            },
          },
        },
      });
      await txBuilder.send();

      const result = await graph.get({
        keys: [`${rootAccountId}/profile/**`],
        useApiServer: false,
      });

      expect(result).toBeDefined();
      expect(result[rootAccountId]).toBeDefined();
    });
  });

  describe('grantWritePermission', () => {
    let granteeAccountId: string;

    beforeAll(async () => {
      granteeAccountId = `grantee.${rootAccountId}`;
      await near
        .transaction(rootAccountId)
        .createAccount(granteeAccountId)
        .transfer(granteeAccountId, '5 NEAR')
        .send();

      const setTx = await graph.set({
        signerId: rootAccountId,
        data: {
          [rootAccountId]: {
            granted: {
              path: 'initial_value',
            },
            test: {
              data: 'initial_value',
            },
          },
        },
      });
      await setTx.send();
    });

    it('should create a transaction builder for granting permission', async () => {
      const txBuilder = await graph.grantWritePermission({
        signerId: rootAccountId,
        keys: [`${rootAccountId}/test/data`],
        granteeAccountId,
      });

      expect(txBuilder).toBeDefined();
      expect(typeof txBuilder.send).toBe('function');
    });

    it.skip('should grant permission and verify it', async () => {
      const key = `${rootAccountId}/profile/name`;

      const txBuilder = await graph.grantWritePermission({
        signerId: rootAccountId,
        keys: [key],
        granteeAccountId,
      });
      await txBuilder.send();

      const hasPermission = await graph.isWritePermissionGranted({
        key,
        granteeAccountId,
      });
      expect(hasPermission).toBe(true);
    });
  });

  describe('storageWithdraw', () => {
    it('should create a transaction builder for storage withdrawal', async () => {
      const txBuilder = await graph.storageWithdraw({
        signerId: rootAccountId,
      });

      expect(txBuilder).toBeDefined();
      expect(typeof txBuilder.send).toBe('function');
    });
  });
});

describe('Graph - Direct Contract Calls (useApiServer: false)', () => {
  describe('get', () => {
    beforeAll(async () => {
      const txBuilder = await graph.set({
        signerId: rootAccountId,
        data: {
          [rootAccountId]: {
            test: {
              key1: 'value1',
              key2: 'value2',
            },
          },
        },
      });
      await txBuilder.send();
    });

    it('should retrieve data directly from contract', async () => {
      const result = await graph.get({
        keys: [`${rootAccountId}/test/**`],
        useApiServer: false,
      });

      expect(result).toBeDefined();
      expect(result[rootAccountId]).toBeDefined();
    });

    it('should support withBlockHeight option', async () => {
      const result = await graph.get({
        keys: [`${rootAccountId}/test/**`],
        useApiServer: false,
        withBlockHeight: true,
      });

      expect(result).toBeDefined();
    });

    it('should support withNodeId option', async () => {
      const result = await graph.get({
        keys: [`${rootAccountId}/test/**`],
        useApiServer: false,
        withNodeId: true,
      });

      expect(result).toBeDefined();
    });
  });

  describe('keys', () => {
    it('should retrieve keys directly from contract', async () => {
      const result = await graph.keys({
        keys: [`${rootAccountId}/**`],
        useApiServer: false,
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should support returnType option', async () => {
      const result = await graph.keys({
        keys: [`${rootAccountId}/**`],
        useApiServer: false,
        returnType: 'BlockHeight',
      });

      expect(result).toBeDefined();
    });
  });
});
