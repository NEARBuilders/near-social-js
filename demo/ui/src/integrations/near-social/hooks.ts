import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  Social,
  type Profile,
  type IndexEntry,
  type Notification,
  type AccountFeedOptions,
} from 'near-social-js';
import { useWallet } from '../near-wallet';
import { socialKeys } from './query-keys';
import { useMemo } from 'react';
import { useRelayer } from '../../providers';
import { relayerClient } from '../../utils/orpc';

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

export function useDelegateSocialInstance() {
  const { delegateNear } = useRelayer();
  return useMemo(
    () =>
      delegateNear
        ? new Social({ near: delegateNear, network: 'mainnet' })
        : new Social({ network: 'mainnet' }),
    [delegateNear]
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
  options?: Omit<UseQueryOptions<{ accountId: string }[]>, 'queryKey' | 'queryFn'>
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
  const delegateSocial = useDelegateSocialInstance();
  const { isRelayerEnabled, delegateNear } = useRelayer();

  return useMutation({
    mutationFn: async () => {
      if (!accountId || !lookupAccountId) {
        throw new Error('Wallet not connected');
      }

      if (isRelayerEnabled) {
        if (!delegateNear) {
          throw new Error('Delegate key not initialized');
        }
        await relayerClient.connect({ accountId });
        const txBuilder = await delegateSocial.follow(
          accountId,
          lookupAccountId
        );
        const { payload } = await txBuilder.delegate();
        return relayerClient.publish({ payload });
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
  const delegateSocial = useDelegateSocialInstance();
  const { isRelayerEnabled, delegateNear } = useRelayer();

  return useMutation({
    mutationFn: async () => {
      if (!accountId || !lookupAccountId) {
        throw new Error('Wallet not connected');
      }

      if (isRelayerEnabled) {
        if (!delegateNear) {
          throw new Error('Delegate key not initialized');
        }
        await relayerClient.connect({ accountId });
        const txBuilder = await delegateSocial.unfollow(
          accountId,
          lookupAccountId
        );
        const { payload } = await txBuilder.delegate();
        return relayerClient.publish({ payload });
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
  const delegateSocial = useDelegateSocialInstance();
  const { isRelayerEnabled, delegateNear } = useRelayer();

  return useMutation({
    mutationFn: async (profile: Partial<Profile>) => {
      if (!accountId) {
        throw new Error('Wallet not connected');
      }

      if (isRelayerEnabled) {
        if (!delegateNear) {
          throw new Error('Delegate key not initialized');
        }
        await relayerClient.connect({ accountId });
        const txBuilder = await delegateSocial.setProfile(accountId, profile);
        const { payload } = await txBuilder.delegate();
        return relayerClient.publish({ payload });
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
  options?: { comments?: boolean } & Omit<UseQueryOptions<unknown>, 'queryKey' | 'queryFn'>
) {
  const social = useSocialInstance();
  const { comments, ...queryOptions } = options ?? {};

  return useQuery({
    queryKey: socialKeys.post(accountId, blockHeight),
    queryFn: () => social.getPost(accountId, blockHeight, { comments }),
    enabled: !!accountId && !!blockHeight,
    ...queryOptions,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const { accountId } = useWallet();
  const social = useSocialInstance();
  const delegateSocial = useDelegateSocialInstance();
  const { isRelayerEnabled, delegateNear } = useRelayer();

  return useMutation({
    mutationFn: async (post: {
      text: string;
      type?: string;
      image?: { ipfs_cid?: string; url?: string };
    }) => {
      if (!accountId) {
        throw new Error('Wallet not connected');
      }

      if (isRelayerEnabled) {
        if (!delegateNear) {
          throw new Error('Delegate key not initialized');
        }
        await relayerClient.connect({ accountId });
        const txBuilder = await delegateSocial.createPost(accountId, post);
        const { payload } = await txBuilder.delegate();
        return relayerClient.publish({ payload });
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
  const delegateSocial = useDelegateSocialInstance();
  const { isRelayerEnabled, delegateNear } = useRelayer();

  return useMutation({
    mutationFn: async (item: {
      type: string;
      path: string;
      blockHeight: number;
    }) => {
      if (!accountId) {
        throw new Error('Wallet not connected');
      }

      if (isRelayerEnabled) {
        if (!delegateNear) {
          throw new Error('Delegate key not initialized');
        }
        await relayerClient.connect({ accountId });
        const txBuilder = await delegateSocial.like(accountId, item);
        const { payload } = await txBuilder.delegate();
        return relayerClient.publish({ payload });
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
  options?: Omit<UseQueryOptions<IndexEntry[]>, 'queryKey' | 'queryFn'>
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

export function useUnlike() {
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
      const txBuilder = await social.unlike(accountId, item);
      return txBuilder.send();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.all });
    },
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  const { accountId } = useWallet();
  const social = useSocialInstance();

  return useMutation({
    mutationFn: async (comment: {
      item: { type: string; path: string; blockHeight: number };
      text: string;
      image?: { ipfs_cid?: string; url?: string };
    }) => {
      if (!accountId) {
        throw new Error('Wallet not connected');
      }
      const txBuilder = await social.createComment(accountId, comment);
      return txBuilder.send();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.all });
    },
  });
}

export function useComments(
  item: { type: string; path: string; blockHeight: number } | null,
  options?: Omit<UseQueryOptions<IndexEntry[]>, 'queryKey' | 'queryFn'>
) {
  const social = useSocialInstance();

  return useQuery({
    queryKey: socialKeys.comments(
      item?.type || '',
      item?.path || '',
      item?.blockHeight || 0
    ),
    queryFn: () => social.getComments(item!),
    enabled: !!item,
    ...options,
  });
}

export function useRepost() {
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
      const txBuilder = await social.repost(accountId, item);
      return txBuilder.send();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.all });
    },
  });
}

export function useReposts(
  item: { type: string; path: string; blockHeight: number } | null,
  options?: Omit<UseQueryOptions<IndexEntry[]>, 'queryKey' | 'queryFn'>
) {
  const social = useSocialInstance();

  return useQuery({
    queryKey: socialKeys.reposts(
      item?.type || '',
      item?.path || '',
      item?.blockHeight || 0
    ),
    queryFn: () => social.getReposts(item!),
    enabled: !!item,
    ...options,
  });
}

// ============================================
// Feed Hooks
// ============================================

export function useAccountFeed(
  accountId: string,
  options?: AccountFeedOptions & Omit<UseQueryOptions<IndexEntry[]>, 'queryKey' | 'queryFn'>
) {
  const social = useSocialInstance();
  const { limit, from, order, includeReplies, ...queryOptions } = options ?? {};

  return useQuery({
    queryKey: socialKeys.accountFeed(accountId, limit, from, order, includeReplies),
    queryFn: () => social.getAccountFeed(accountId, { limit, from, order, includeReplies }),
    enabled: !!accountId,
    ...queryOptions,
  });
}

export function useHashtagFeed(
  hashtag: string,
  options?: {
    limit?: number;
    from?: number;
    order?: 'asc' | 'desc';
  } & Omit<UseQueryOptions<IndexEntry[]>, 'queryKey' | 'queryFn'>
) {
  const social = useSocialInstance();
  const { limit, from, order, ...queryOptions } = options ?? {};

  return useQuery({
    queryKey: socialKeys.hashtagFeed(hashtag, limit, from, order),
    queryFn: () => social.getHashtagFeed(hashtag, { limit, from, order }),
    enabled: !!hashtag,
    ...queryOptions,
  });
}

export function useActivityFeed(
  options?: {
    limit?: number;
    from?: number;
    order?: 'asc' | 'desc';
  } & Omit<UseQueryOptions<IndexEntry[]>, 'queryKey' | 'queryFn'>
) {
  const social = useSocialInstance();
  const { limit, from, order, ...queryOptions } = options ?? {};

  return useQuery({
    queryKey: socialKeys.activityFeed(limit, from, order),
    queryFn: () => social.getActivityFeed({ limit, from, order }),
    ...queryOptions,
  });
}

export function useMentionedFeed(
  accountId: string,
  options?: {
    limit?: number;
    from?: number;
    order?: 'asc' | 'desc';
  } & Omit<UseQueryOptions<Notification[]>, 'queryKey' | 'queryFn'>
) {
  const social = useSocialInstance();
  const { limit, from, order, ...queryOptions } = options ?? {};

  return useQuery({
    queryKey: socialKeys.mentionedFeed(accountId, limit, from, order),
    queryFn: () => social.getMentionedFeed(accountId, { limit, from, order }),
    enabled: !!accountId,
    ...queryOptions,
  });
}

// ============================================
// Notification Hooks
// ============================================

export function useNotifications(
  accountId: string,
  options?: {
    limit?: number;
    from?: number;
    order?: 'asc' | 'desc';
  } & Omit<UseQueryOptions<Notification[]>, 'queryKey' | 'queryFn'>
) {
  const social = useSocialInstance();
  const { limit, from, order, ...queryOptions } = options ?? {};

  return useQuery({
    queryKey: socialKeys.notifications(accountId, limit, from, order),
    queryFn: () => social.getNotifications(accountId, { limit, from, order }),
    enabled: !!accountId,
    ...queryOptions,
  });
}

export function useNotify() {
  const queryClient = useQueryClient();
  const { accountId } = useWallet();
  const social = useSocialInstance();

  return useMutation({
    mutationFn: async ({
      targetAccountId,
      item,
      type = 'custom',
    }: {
      targetAccountId: string;
      item?: { type: string; path: string; blockHeight: number };
      type?: string;
    }) => {
      if (!accountId) {
        throw new Error('Wallet not connected');
      }
      const txBuilder = await social.notify(
        accountId,
        targetAccountId,
        item,
        type
      );
      return txBuilder.send();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.all });
    },
  });
}

// ============================================
// Poke Hook
// ============================================

export function usePoke() {
  const queryClient = useQueryClient();
  const { accountId } = useWallet();
  const social = useSocialInstance();

  return useMutation({
    mutationFn: async (targetAccountId: string) => {
      if (!accountId) {
        throw new Error('Wallet not connected');
      }
      const txBuilder = await social.poke(accountId, targetAccountId);
      return txBuilder.send();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.all });
    },
  });
}
