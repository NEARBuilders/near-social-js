import { createPlugin } from 'every-plugin';
import { Effect } from 'every-plugin/effect';
import { z } from 'every-plugin/zod';
import { Near, InMemoryKeyStore, parseKey, type Network } from 'near-kit';

import { contract } from './contract';
import { ApiService } from './service';

export * from './schema';

export default createPlugin({
  variables: z.object({
    network: z.enum(['mainnet', 'testnet']).default('mainnet'),
    contractId: z.string().default('social.near'),
    nodeUrl: z.string().optional(),
  }),

  secrets: z.object({
    apiAccountId: z.string().min(1, 'API account ID is required'),
    apiPrivateKey: z.string().min(1, 'API private key is required'),
  }),

  contract,

  initialize: (config) =>
    Effect.gen(function* () {
      const networkConfig = config.variables.nodeUrl
        ? {
            networkId: config.variables.network,
            rpcUrl: config.variables.nodeUrl,
          }
        : (config.variables.network as Network);

      console.log(`[API Init] apiAccountId: ${config.secrets.apiAccountId}`);

      console.log(`[API Init] network: ${config.variables.network}`);
      console.log(`[API Init] contractId: ${config.variables.contractId}`);

      // add key to keyStore
      const keyStore = new InMemoryKeyStore();
      yield* Effect.promise(() =>
        keyStore.add(
          config.secrets.apiAccountId,
          parseKey(config.secrets.apiPrivateKey)
        )
      );

      const near = new Near({
        network: networkConfig,
        keyStore,
        defaultSignerId: config.secrets.apiAccountId,
        defaultWaitUntil: 'FINAL', // wait until transactions complete before responding
      });

      const service = new ApiService(
        near,
        config.secrets.apiAccountId,
        config.variables.contractId
      );

      console.debug('[API Init] ApiService initialized');

      return { service };
    }),

  shutdown: () => Effect.void,

  createRouter: (context, builder) => {
    const { service } = context;

    return {
      connect: builder.connect.handler(async ({ input }) => {
        return await service.ensureStorageDeposit(input.accountId);
      }),

      publish: builder.publish.handler(async ({ input }) => {
        return await service.submitDelegateAction(input.payload);
      }),

      ping: builder.ping.handler(async () => {
        return {
          status: 'ok' as const,
          timestamp: new Date().toISOString(),
        };
      }),
    };
  },
});
