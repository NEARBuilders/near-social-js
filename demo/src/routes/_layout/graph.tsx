import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { Graph } from 'near-social-js'
import { useWallet } from '../../integrations/near-wallet'
import { MethodCard } from '../../components/method-card'
import { ResponsePanel } from '../../components/response-panel'

export const Route = createFileRoute('/_layout/graph')({
  component: GraphPage,
})

function GraphPage() {
  const { accountId, social } = useWallet()
  const [response, setResponse] = useState<unknown>(null)

  const graph = useMemo(() => social ?? new Graph({ network: 'mainnet' }), [social])

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
        const keys = params.keys.split(',').map((k) => k.trim())
        return graph.get({ keys })
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
        const keys = params.keys.split(',').map((k) => k.trim())
        return graph.keys({ keys })
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
        })
      },
    },
    {
      name: 'getVersion',
      description: 'Get the contract version',
      fields: [],
      requiresWallet: false,
      execute: async () => {
        return graph.getVersion()
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
        return graph.getAccount({ accountId: params.accountId })
      },
    },
    {
      name: 'getAccountCount',
      description: 'Get total number of accounts in the contract',
      fields: [],
      requiresWallet: false,
      execute: async () => {
        return graph.getAccountCount()
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
        return graph.storageBalanceOf(params.accountId)
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
        })
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
        if (!accountId || !social) throw new Error('Wallet not connected')
        const data = JSON.parse(params.data)
        return social.set({ signerId: accountId, data })
      },
    },
  ]

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background:
          'radial-gradient(ellipse at top right, rgba(0, 236, 151, 0.15) 0%, rgba(10, 31, 28, 0.8) 50%, #0d1117 100%)',
      }}
    >
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
          <div className="sticky bottom-4">
            <ResponsePanel data={response} />
          </div>
        )}
      </div>
    </div>
  )
}
