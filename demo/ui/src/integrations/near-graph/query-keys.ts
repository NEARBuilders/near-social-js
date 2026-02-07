export const graphKeys = {
  all: ['graph'] as const,
  get: (keys: string[]) => [...graphKeys.all, 'get', keys] as const,
  keys: (patterns: string[]) => [...graphKeys.all, 'keys', patterns] as const,
  index: (action: string, key: string, limit?: number) =>
    [...graphKeys.all, 'index', action, key, limit] as const,
  version: () => [...graphKeys.all, 'version'] as const,
  account: (accountId: string) =>
    [...graphKeys.all, 'account', accountId] as const,
  accounts: (fromIndex?: number, limit?: number) =>
    [...graphKeys.all, 'accounts', fromIndex, limit] as const,
  accountCount: () => [...graphKeys.all, 'accountCount'] as const,
  node: (nodeId: number, fromIndex?: number, limit?: number) =>
    [...graphKeys.all, 'node', nodeId, fromIndex, limit] as const,
  nodes: (fromIndex?: number, limit?: number) =>
    [...graphKeys.all, 'nodes', fromIndex, limit] as const,
  nodeCount: () => [...graphKeys.all, 'nodeCount'] as const,
  storageBalance: (accountId: string) =>
    [...graphKeys.all, 'storageBalance', accountId] as const,
  writePermission: (key: string, granteeAccountId?: string) =>
    [...graphKeys.all, 'writePermission', key, granteeAccountId] as const,
};
