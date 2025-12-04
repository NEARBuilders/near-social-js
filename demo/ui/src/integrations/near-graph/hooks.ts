import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { Graph } from 'near-social-js';
import { useWallet } from '../near-wallet';
import { graphKeys } from './query-keys';
import { socialKeys } from '../near-social/query-keys';
import { useMemo } from 'react';

export function useGraphInstance() {
  const { near } = useWallet();
  return useMemo(
    () =>
      near
        ? new Graph({ near, network: 'mainnet' })
        : new Graph({ network: 'mainnet' }),
    [near]
  );
}

export function useGraphGet(
  keys: string[],
  options?: Omit<UseQueryOptions<unknown>, 'queryKey' | 'queryFn'>
) {
  const graph = useGraphInstance();

  return useQuery({
    queryKey: graphKeys.get(keys),
    queryFn: () => graph.get({ keys }),
    enabled: keys.length > 0,
    ...options,
  });
}

export function useGraphKeys(
  patterns: string[],
  options?: Omit<UseQueryOptions<unknown>, 'queryKey' | 'queryFn'>
) {
  const graph = useGraphInstance();

  return useQuery({
    queryKey: graphKeys.keys(patterns),
    queryFn: () => graph.keys({ keys: patterns }),
    enabled: patterns.length > 0,
    ...options,
  });
}

export function useGraphIndex(
  action: string,
  key: string,
  limit?: number,
  options?: Omit<UseQueryOptions<unknown>, 'queryKey' | 'queryFn'>
) {
  const graph = useGraphInstance();

  return useQuery({
    queryKey: graphKeys.index(action, key, limit),
    queryFn: () => graph.index({ action, key, limit }),
    enabled: !!action && !!key,
    ...options,
  });
}

export function useGraphVersion(
  options?: Omit<UseQueryOptions<unknown>, 'queryKey' | 'queryFn'>
) {
  const graph = useGraphInstance();

  return useQuery({
    queryKey: graphKeys.version(),
    queryFn: () => graph.getVersion(),
    staleTime: Infinity,
    ...options,
  });
}

export function useGraphAccount(
  accountId: string,
  options?: Omit<UseQueryOptions<unknown>, 'queryKey' | 'queryFn'>
) {
  const graph = useGraphInstance();

  return useQuery({
    queryKey: graphKeys.account(accountId),
    queryFn: () => graph.getAccount({ accountId }),
    enabled: !!accountId,
    ...options,
  });
}

export function useGraphAccountCount(
  options?: Omit<UseQueryOptions<unknown>, 'queryKey' | 'queryFn'>
) {
  const graph = useGraphInstance();

  return useQuery({
    queryKey: graphKeys.accountCount(),
    queryFn: () => graph.getAccountCount(),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useGraphStorageBalance(
  accountId: string,
  options?: Omit<UseQueryOptions<unknown>, 'queryKey' | 'queryFn'>
) {
  const graph = useGraphInstance();

  return useQuery({
    queryKey: graphKeys.storageBalance(accountId),
    queryFn: () => graph.storageBalanceOf(accountId),
    enabled: !!accountId,
    ...options,
  });
}

export function useGraphWritePermission(
  key: string,
  granteeAccountId?: string,
  options?: Omit<UseQueryOptions<unknown>, 'queryKey' | 'queryFn'>
) {
  const graph = useGraphInstance();

  return useQuery({
    queryKey: graphKeys.writePermission(key, granteeAccountId),
    queryFn: () => graph.isWritePermissionGranted({ key, granteeAccountId }),
    enabled: !!key,
    ...options,
  });
}

export function useGraphSet() {
  const queryClient = useQueryClient();
  const { accountId } = useWallet();
  const graph = useGraphInstance();

  return useMutation({
    mutationFn: (data: Record<string, Record<string, unknown>>) => {
      if (!accountId) {
        throw new Error('Wallet not connected');
      }
      return graph.set({ signerId: accountId, data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: graphKeys.all });
      queryClient.invalidateQueries({ queryKey: socialKeys.all });
    },
  });
}
