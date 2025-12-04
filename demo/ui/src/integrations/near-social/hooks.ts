import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { Social, type Profile } from 'near-social-js';
import { useWallet } from '../near-wallet';
import { socialKeys } from './query-keys';
import { useMemo } from 'react';

export function useSocialInstance() {
  const { near } = useWallet();
  return useMemo(
    () =>
      near
        ? new Social({ near, network: 'mainnet' })
        : new Social({ network: 'mainnet' }),
    [near]
  );
}

export function useProfile(
  accountId: string,
  options?: Omit<UseQueryOptions<Profile | null>, 'queryKey' | 'queryFn'>
) {
  const social = useSocialInstance();

  return useQuery({
    queryKey: socialKeys.profile(accountId),
    queryFn: () => social.getProfile(accountId),
    enabled: !!accountId,
    ...options,
  });
}

export function useFollowers(
  accountId: string,
  options?: Omit<UseQueryOptions<unknown[]>, 'queryKey' | 'queryFn'>
) {
  const social = useSocialInstance();

  return useQuery({
    queryKey: socialKeys.followers(accountId),
    queryFn: () => social.getFollowers(accountId),
    enabled: !!accountId,
    ...options,
  });
}

export function useFollowing(
  accountId: string,
  options?: Omit<
    UseQueryOptions<Record<string, unknown>>,
    'queryKey' | 'queryFn'
  >
) {
  const social = useSocialInstance();

  return useQuery({
    queryKey: socialKeys.following(accountId),
    queryFn: () => social.getFollowing(accountId),
    enabled: !!accountId,
    ...options,
  });
}

export function useFollow(lookupAccountId: string) {
  const queryClient = useQueryClient();
  const { accountId } = useWallet();
  const social = useSocialInstance();

  return useMutation({
    mutationFn: async () => {
      if (!accountId || !lookupAccountId) {
        throw new Error('Wallet not connected');
      }
      const txBuilder = await social.follow(accountId, lookupAccountId);
      return txBuilder.send();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: socialKeys.followers(lookupAccountId),
      });
      if (accountId) {
        queryClient.invalidateQueries({
          queryKey: socialKeys.following(accountId),
        });
      }
    },
  });
}

export function useUnfollow(lookupAccountId: string) {
  const queryClient = useQueryClient();
  const { accountId } = useWallet();
  const social = useSocialInstance();

  return useMutation({
    mutationFn: async () => {
      if (!accountId || !lookupAccountId) {
        throw new Error('Wallet not connected');
      }
      const txBuilder = await social.unfollow(accountId, lookupAccountId);
      return txBuilder.send();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: socialKeys.followers(lookupAccountId),
      });
      if (accountId) {
        queryClient.invalidateQueries({
          queryKey: socialKeys.following(accountId),
        });
      }
    },
  });
}

export function useSetProfile() {
  const queryClient = useQueryClient();
  const { accountId } = useWallet();
  const social = useSocialInstance();

  return useMutation({
    mutationFn: async (profile: Partial<Profile>) => {
      if (!accountId) {
        throw new Error('Wallet not connected');
      }
      const txBuilder = await social.setProfile(accountId, profile);
      return txBuilder.send();
    },
    onSuccess: () => {
      if (accountId) {
        queryClient.invalidateQueries({
          queryKey: socialKeys.profile(accountId),
        });
      }
    },
  });
}
