import { Graph } from './graph';
import type { GraphOptions, IndexOptions } from './types';

export interface Profile {
  name?: string;
  description?: string;
  image?: {
    ipfs_cid?: string;
    url?: string;
  };
  backgroundImage?: {
    ipfs_cid?: string;
    url?: string;
  };
  linktree?: Record<string, string>;
  tags?: Record<string, string>;
  [key: string]: unknown;
}

export interface Post {
  main: string;
  image?: {
    ipfs_cid?: string;
    url?: string;
  };
  [key: string]: unknown;
}

export type SocialOptions = GraphOptions;

export class Social extends Graph {
  constructor(options?: SocialOptions) {
    super(options);
  }

  async getProfile(accountId: string): Promise<Profile | null> {
    const result = await this.get({
      keys: [`${accountId}/profile/**`],
    });

    const accountData = result[accountId] as { profile?: Profile } | undefined;
    return accountData?.profile ?? null;
  }

  async setProfile(signerId: string, profile: Partial<Profile>) {
    return this.set({
      signerId,
      data: {
        [signerId]: {
          profile,
        },
      },
    });
  }

  async getPost(accountId: string, blockHeight: number): Promise<Post | null> {
    const result = await this.get({
      keys: [`${accountId}/post/main`],
      blockHeight: BigInt(blockHeight),
    });

    const accountData = result[accountId] as { post?: Post } | undefined;
    return accountData?.post ?? null;
  }

  async createPost(signerId: string, post: Post) {
    return this.set({
      signerId,
      data: {
        [signerId]: {
          post: {
            main: JSON.stringify(post),
          },
          index: {
            post: JSON.stringify({
              key: 'main',
              value: {
                type: 'md',
              },
            }),
          },
        },
      },
    });
  }

  async getFollowers(accountId: string): Promise<unknown[]> {
    return this.index({
      action: 'graph',
      key: 'follow',
      options: {
        accountId,
        order: 'desc',
      },
    } as IndexOptions);
  }

  async getFollowing(accountId: string): Promise<Record<string, unknown>> {
    const result = await this.get({
      keys: [`${accountId}/graph/follow/**`],
    });

    const accountData = result[accountId] as
      | { graph?: { follow?: Record<string, unknown> } }
      | undefined;
    return accountData?.graph?.follow ?? {};
  }

  async follow(signerId: string, accountId: string) {
    return this.set({
      signerId,
      data: {
        [signerId]: {
          graph: {
            follow: {
              [accountId]: '',
            },
          },
          index: {
            graph: JSON.stringify({
              key: 'follow',
              value: {
                type: 'follow',
                accountId,
              },
            }),
          },
        },
      },
    });
  }

  async unfollow(signerId: string, accountId: string) {
    return this.set({
      signerId,
      data: {
        [signerId]: {
          graph: {
            follow: {
              [accountId]: null,
            },
          },
          index: {
            graph: JSON.stringify({
              key: 'follow',
              value: {
                type: 'unfollow',
                accountId,
              },
            }),
          },
        },
      },
    });
  }

  async like(
    signerId: string,
    item: { type: string; path: string; blockHeight: number }
  ) {
    return this.set({
      signerId,
      data: {
        [signerId]: {
          index: {
            like: JSON.stringify({
              key: item,
              value: {
                type: 'like',
              },
            }),
          },
        },
      },
    });
  }

  async getLikes(item: {
    type: string;
    path: string;
    blockHeight: number;
  }): Promise<unknown[]> {
    return this.index({
      action: 'like',
      key: item,
    });
  }
}
