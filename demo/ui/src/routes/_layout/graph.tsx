import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useWallet } from '../../integrations/near-wallet';
import {
  useGraphInstance,
  useGraphSet,
  useGraphGrantWritePermission,
  useGraphStorageDeposit,
  useGraphStorageWithdraw,
  useGraphStorageUnregister,
} from '../../integrations/near-graph';
import { MethodCard } from '../../components/method-card';
import { ResponsePanel } from '../../components/response-panel';

export const Route = createFileRoute('/_layout/graph')({
  component: GraphPage,
});

function GraphPage() {
  const { accountId } = useWallet();
  const [response, setResponse] = useState<unknown>(null);
  const graph = useGraphInstance();
  const graphSetMutation = useGraphSet();
  const grantWritePermissionMutation = useGraphGrantWritePermission();
  const storageDepositMutation = useGraphStorageDeposit();
  const storageWithdrawMutation = useGraphStorageWithdraw();
  const storageUnregisterMutation = useGraphStorageUnregister();

  const methods = [
    {
      name: 'get',
      description: 'Fetch data from the social graph by key patterns',
      fields: [
        {
          name: 'keys',
          label: 'Keys (comma-separated)',
          type: 'text' as const,
          placeholder: 'alice.near/profile/**, bob.near/post/main',
          required: true,
        },
      ],
      requiresWallet: false,
      execute: async (params: Record<string, string>) => {
        const keys = params.keys.split(',').map((k) => k.trim());
        return graph.get({ keys });
      },
    },
    {
      name: 'keys',
      description: 'List keys matching a pattern',
      fields: [
        {
          name: 'keys',
          label: 'Key Patterns (comma-separated)',
          type: 'text' as const,
          placeholder: 'alice.near/profile/*',
          required: true,
        },
      ],
      requiresWallet: false,
      execute: async (params: Record<string, string>) => {
        const keys = params.keys.split(',').map((k) => k.trim());
        return graph.keys({ keys });
      },
    },
    {
      name: 'index',
      description: 'Query indexed data by action and key',
      fields: [
        {
          name: 'action',
          label: 'Action',
          type: 'text' as const,
          placeholder: 'post, like, graph',
          required: true,
        },
        {
          name: 'key',
          label: 'Key',
          type: 'text' as const,
          placeholder: 'main, follow',
          required: true,
        },
        {
          name: 'limit',
          label: 'Limit',
          type: 'number' as const,
          placeholder: '10',
          required: false,
        },
      ],
      requiresWallet: false,
      execute: async (params: Record<string, string>) => {
        return graph.index({
          action: params.action,
          key: params.key,
          limit: params.limit ? parseInt(params.limit) : undefined,
        });
      },
    },
    {
      name: 'getVersion',
      description: 'Get the contract version',
      fields: [],
      requiresWallet: false,
      execute: async () => {
        return graph.getVersion();
      },
    },
    {
      name: 'getAccount',
      description: 'Get account information from the contract',
      fields: [
        {
          name: 'accountId',
          label: 'Account ID',
          type: 'text' as const,
          placeholder: 'alice.near',
          required: true,
        },
      ],
      requiresWallet: false,
      execute: async (params: Record<string, string>) => {
        return graph.getAccount({ accountId: params.accountId });
      },
    },
    {
      name: 'getAccountCount',
      description: 'Get total number of accounts in the contract',
      fields: [],
      requiresWallet: false,
      execute: async () => {
        return graph.getAccountCount();
      },
    },
    {
      name: 'storageBalanceOf',
      description: 'Get storage balance for an account',
      fields: [
        {
          name: 'accountId',
          label: 'Account ID',
          type: 'text' as const,
          placeholder: 'alice.near',
          required: true,
        },
      ],
      requiresWallet: false,
      execute: async (params: Record<string, string>) => {
        return graph.storageBalanceOf(params.accountId);
      },
    },
    {
      name: 'isWritePermissionGranted',
      description: 'Check if write permission is granted for a key',
      fields: [
        {
          name: 'key',
          label: 'Key',
          type: 'text' as const,
          placeholder: 'alice.near/profile/name',
          required: true,
        },
        {
          name: 'granteeAccountId',
          label: 'Grantee Account ID',
          type: 'text' as const,
          placeholder: 'bob.near',
          required: false,
        },
      ],
      requiresWallet: false,
      execute: async (params: Record<string, string>) => {
        return graph.isWritePermissionGranted({
          key: params.key,
          granteeAccountId: params.granteeAccountId || undefined,
        });
      },
    },
    {
      name: 'set',
      description: 'Write data to the social graph (requires wallet)',
      fields: [
        {
          name: 'data',
          label: 'Data (JSON)',
          type: 'textarea' as const,
          placeholder: '{"alice.near": {"profile": {"name": "Alice"}}}',
          required: true,
        },
      ],
      requiresWallet: true,
      execute: async (params: Record<string, string>) => {
        if (!accountId) throw new Error('Wallet not connected');
        const data = JSON.parse(params.data) as Record<
          string,
          Record<string, unknown>
        >;
        return graphSetMutation.mutateAsync(data);
      },
    },
    {
      name: 'getAccounts',
      description: 'Get paginated list of accounts',
      fields: [
        {
          name: 'fromIndex',
          label: 'From Index',
          type: 'number' as const,
          placeholder: '0',
          required: false,
        },
        {
          name: 'limit',
          label: 'Limit',
          type: 'number' as const,
          placeholder: '10',
          required: false,
        },
      ],
      requiresWallet: false,
      execute: async (params: Record<string, string>) => {
        return graph.getAccounts({
          fromIndex: params.fromIndex ? parseInt(params.fromIndex) : undefined,
          limit: params.limit ? parseInt(params.limit) : undefined,
        });
      },
    },
    {
      name: 'getNode',
      description: 'Get node by ID with pagination',
      fields: [
        {
          name: 'nodeId',
          label: 'Node ID',
          type: 'number' as const,
          placeholder: '1',
          required: true,
        },
        {
          name: 'fromIndex',
          label: 'From Index',
          type: 'number' as const,
          placeholder: '0',
          required: false,
        },
        {
          name: 'limit',
          label: 'Limit',
          type: 'number' as const,
          placeholder: '10',
          required: false,
        },
      ],
      requiresWallet: false,
      execute: async (params: Record<string, string>) => {
        return graph.getNode({
          nodeId: parseInt(params.nodeId),
          fromIndex: params.fromIndex ? parseInt(params.fromIndex) : undefined,
          limit: params.limit ? parseInt(params.limit) : undefined,
        });
      },
    },
    {
      name: 'getNodes',
      description: 'Get paginated list of nodes',
      fields: [
        {
          name: 'fromIndex',
          label: 'From Index',
          type: 'number' as const,
          placeholder: '0',
          required: false,
        },
        {
          name: 'limit',
          label: 'Limit',
          type: 'number' as const,
          placeholder: '10',
          required: false,
        },
      ],
      requiresWallet: false,
      execute: async (params: Record<string, string>) => {
        return graph.getNodes({
          fromIndex: params.fromIndex ? parseInt(params.fromIndex) : undefined,
          limit: params.limit ? parseInt(params.limit) : undefined,
        });
      },
    },
    {
      name: 'getNodeCount',
      description: 'Get total node count',
      fields: [],
      requiresWallet: false,
      execute: async () => {
        return graph.getNodeCount();
      },
    },
    {
      name: 'grantWritePermission',
      description: 'Grant write permission for keys (requires wallet)',
      fields: [
        {
          name: 'keys',
          label: 'Keys (comma-separated)',
          type: 'text' as const,
          placeholder: 'alice.near/profile/name, alice.near/profile/bio',
          required: true,
        },
        {
          name: 'granteeAccountId',
          label: 'Grantee Account ID',
          type: 'text' as const,
          placeholder: 'bob.near',
          required: false,
        },
        {
          name: 'granteePublicKey',
          label: 'Grantee Public Key',
          type: 'text' as const,
          placeholder: 'ed25519:...',
          required: false,
        },
      ],
      requiresWallet: true,
      execute: async (params: Record<string, string>) => {
        if (!accountId) throw new Error('Wallet not connected');
        const keys = params.keys.split(',').map((k) => k.trim());
        return grantWritePermissionMutation.mutateAsync({
          keys,
          granteeAccountId: params.granteeAccountId || undefined,
          granteePublicKey: params.granteePublicKey || undefined,
        });
      },
    },
    {
      name: 'storageDeposit',
      description: 'Deposit storage for an account (requires wallet)',
      fields: [
        {
          name: 'accountId',
          label: 'Account ID (optional, defaults to signer)',
          type: 'text' as const,
          placeholder: 'alice.near',
          required: false,
        },
        {
          name: 'deposit',
          label: 'Deposit Amount (in yoctoNEAR)',
          type: 'text' as const,
          placeholder: '10000000000000000000000',
          required: true,
        },
        {
          name: 'registrationOnly',
          label: 'Registration Only',
          type: 'text' as const,
          placeholder: 'true or false',
          required: false,
        },
      ],
      requiresWallet: true,
      execute: async (params: Record<string, string>) => {
        if (!accountId) throw new Error('Wallet not connected');
        return storageDepositMutation.mutateAsync({
          accountId: params.accountId || undefined,
          deposit: params.deposit,
          registrationOnly:
            params.registrationOnly === 'true' ? true : undefined,
        });
      },
    },
    {
      name: 'storageWithdraw',
      description: 'Withdraw available storage (requires wallet)',
      fields: [
        {
          name: 'amount',
          label: 'Amount (optional, defaults to all available)',
          type: 'text' as const,
          placeholder: '10000000000000000000000',
          required: false,
        },
      ],
      requiresWallet: true,
      execute: async (params: Record<string, string>) => {
        if (!accountId) throw new Error('Wallet not connected');
        return storageWithdrawMutation.mutateAsync({
          amount: params.amount || undefined,
        });
      },
    },
    {
      name: 'storageUnregister',
      description: 'Unregister storage (requires wallet)',
      fields: [
        {
          name: 'force',
          label: 'Force',
          type: 'text' as const,
          placeholder: 'true or false',
          required: false,
        },
      ],
      requiresWallet: true,
      execute: async (params: Record<string, string>) => {
        if (!accountId) throw new Error('Wallet not connected');
        return storageUnregisterMutation.mutateAsync({
          force:
            params.force === 'true'
              ? true
              : params.force === 'false'
                ? false
                : undefined,
        });
      },
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 pb-[300px] md:pb-[250px] max-w-4xl text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Graph Methods</h1>
        <p className="text-white/60">
          Low-level methods for interacting with the NEAR Social graph contract.
        </p>
      </div>

      <div className="grid gap-4 mb-8">
        {methods.map((method) => (
          <MethodCard
            key={method.name}
            name={method.name}
            description={method.description}
            fields={method.fields}
            requiresWallet={method.requiresWallet}
            isConnected={!!accountId}
            onExecute={method.execute}
            onResult={setResponse}
          />
        ))}
      </div>

      {response !== null && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/95 via-black/90 to-transparent pt-8 pb-4 px-4 md:px-8">
          <div className="container mx-auto max-w-4xl">
            <ResponsePanel data={response} variant="fixed" />
          </div>
        </div>
      )}
    </div>
  );
}
