export const socialKeys = {
  all: ['social'] as const,
  profiles: () => [...socialKeys.all, 'profile'] as const,
  profile: (accountId: string) => [...socialKeys.profiles(), accountId] as const,
  followers: (accountId: string) => [...socialKeys.all, 'followers', accountId] as const,
  following: (accountId: string) => [...socialKeys.all, 'following', accountId] as const,
}

export const graphKeys = {
  all: ['graph'] as const,
  get: (keys: string[]) => [...graphKeys.all, 'get', keys] as const,
  keys: (patterns: string[]) => [...graphKeys.all, 'keys', patterns] as const,
  index: (action: string, key: string, limit?: number) =>
    [...graphKeys.all, 'index', action, key, limit] as const,
  version: () => [...graphKeys.all, 'version'] as const,
  account: (accountId: string) => [...graphKeys.all, 'account', accountId] as const,
  accountCount: () => [...graphKeys.all, 'accountCount'] as const,
  storageBalance: (accountId: string) => [...graphKeys.all, 'storageBalance', accountId] as const,
  writePermission: (key: string, granteeAccountId?: string) =>
    [...graphKeys.all, 'writePermission', key, granteeAccountId] as const,
}
