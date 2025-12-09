import { createPlugin } from 'every-plugin';
import { Effect } from 'every-plugin/effect';
import { z } from 'every-plugin/zod';
import { Near, InMemoryKeyStore, parseKey, type Network } from 'near-kit';

import { contract } from './contract';
import { RelayerService } from './service';

export * from './schema';

export default createPlugin({
  variables: z.object({
    network: z.enum(['mainnet', 'testnet']).default('mainnet'),
    contractId: z.string().default('social.near'),
    nodeUrl: z.string().optional(),
  }),

  secrets: z.object({
    relayerAccountId: z.string().min(1, 'Relayer account ID is required'),
    relayerPrivateKey: z.string().min(1, 'Relayer private key is required'),
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

      console.log(`[Relayer Init] relayerAccountId: ${config.secrets.relayerAccountId}`);

      console.log(`[Relayer Init] network: ${config.variables.network}`);
      console.log(`[Relayer Init] contractId: ${config.variables.contractId}`);

      // add key to keyStore
      const keyStore = new InMemoryKeyStore();
      yield* Effect.promise(() =>
        keyStore.add(
          config.secrets.relayerAccountId,
          parseKey(config.secrets.relayerPrivateKey)
        )
      );

      const near = new Near({
        network: networkConfig,
        keyStore,
        defaultSignerId: config.secrets.relayerAccountId,
        defaultWaitUntil: 'FINAL', // wait until transactions complete before responding
      });

      const service = new RelayerService(
        near,
        config.secrets.relayerAccountId,
        config.variables.contractId
      );

      console.debug('[Relayer Init] RelayerService initialized');

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
