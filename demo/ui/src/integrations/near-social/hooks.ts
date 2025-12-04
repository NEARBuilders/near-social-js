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
    UseQueryOptions<Record<string, unknown> | null>,
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

export function usePost(
  accountId: string,
  blockHeight: number,
  options?: Omit<UseQueryOptions<unknown>, 'queryKey' | 'queryFn'>
) {
  const social = useSocialInstance();

  return useQuery({
    queryKey: socialKeys.post(accountId, blockHeight),
    queryFn: () => social.getPost(accountId, blockHeight),
    enabled: !!accountId && !!blockHeight,
    ...options,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const { accountId } = useWallet();
  const social = useSocialInstance();

  return useMutation({
    mutationFn: async (post: {
      main: string;
      image?: { ipfs_cid?: string; url?: string };
      [key: string]: unknown;
    }) => {
      if (!accountId) {
        throw new Error('Wallet not connected');
      }
      const txBuilder = await social.createPost(accountId, post);
      return txBuilder.send();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.all });
    },
  });
}

export function useLike() {
  const queryClient = useQueryClient();
  const { accountId } = useWallet();
  const social = useSocialInstance();

  return useMutation({
    mutationFn: async (item: {
      type: string;
      path: string;
      blockHeight: number;
    }) => {
      if (!accountId) {
        throw new Error('Wallet not connected');
      }
      const txBuilder = await social.like(accountId, item);
      return txBuilder.send();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.all });
    },
  });
}

export function useLikes(
  item: { type: string; path: string; blockHeight: number } | null,
  options?: Omit<UseQueryOptions<unknown[]>, 'queryKey' | 'queryFn'>
) {
  const social = useSocialInstance();

  return useQuery({
    queryKey: socialKeys.likes(
      item?.type || '',
      item?.path || '',
      item?.blockHeight || 0
    ),
    queryFn: () => social.getLikes(item!),
    enabled: !!item,
    ...options,
  });
}
