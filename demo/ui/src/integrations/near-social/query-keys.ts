export const socialKeys = {
  all: ['social'] as const,
  profiles: () => [...socialKeys.all, 'profile'] as const,
  profile: (accountId: string) =>
    [...socialKeys.profiles(), accountId] as const,
  followers: (accountId: string) =>
    [...socialKeys.all, 'followers', accountId] as const,
  following: (accountId: string) =>
    [...socialKeys.all, 'following', accountId] as const,
};
