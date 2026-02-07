export const socialKeys = {
  all: ['social'] as const,
  profiles: () => [...socialKeys.all, 'profile'] as const,
  profile: (accountId: string) =>
    [...socialKeys.profiles(), accountId] as const,
  followers: (accountId: string) =>
    [...socialKeys.all, 'followers', accountId] as const,
  following: (accountId: string) =>
    [...socialKeys.all, 'following', accountId] as const,
  post: (accountId: string, blockHeight: number) =>
    [...socialKeys.all, 'post', accountId, blockHeight] as const,
  likes: (type: string, path: string, blockHeight: number) =>
    [...socialKeys.all, 'likes', type, path, blockHeight] as const,
  comments: (type: string, path: string, blockHeight: number) =>
    [...socialKeys.all, 'comments', type, path, blockHeight] as const,
  reposts: (type: string, path: string, blockHeight: number) =>
    [...socialKeys.all, 'reposts', type, path, blockHeight] as const,
  // Feed query keys
  accountFeed: (
    accountId: string,
    limit?: number,
    from?: number,
    order?: string,
    includeReplies?: boolean
  ) =>
    [...socialKeys.all, 'accountFeed', accountId, limit, from, order, includeReplies] as const,
  hashtagFeed: (
    hashtag: string,
    limit?: number,
    from?: number,
    order?: string
  ) => [...socialKeys.all, 'hashtagFeed', hashtag, limit, from, order] as const,
  activityFeed: (limit?: number, from?: number, order?: string) =>
    [...socialKeys.all, 'activityFeed', limit, from, order] as const,
  mentionedFeed: (
    accountId: string,
    limit?: number,
    from?: number,
    order?: string
  ) =>
    [...socialKeys.all, 'mentionedFeed', accountId, limit, from, order] as const,
  // Notification query keys
  notifications: (
    accountId: string,
    limit?: number,
    from?: number,
    order?: string
  ) =>
    [...socialKeys.all, 'notifications', accountId, limit, from, order] as const,
};
