import { Graph } from './graph';
import type { GraphOptions } from './types';

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
  text: string;
  type?: string;
  image?: {
    ipfs_cid?: string;
    url?: string;
  };
}

export interface CommentItem {
  type: string;
  path: string;
  blockHeight: number;
}

export interface Comment {
  item: CommentItem;
  text: string;
  image?: {
    ipfs_cid?: string;
    url?: string;
  };
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

    if (!result) return null;

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

    if (!result) return null;

    const accountData = result[accountId] as { post?: Post } | undefined;
    return accountData?.post ?? null;
  }

  async createPost(signerId: string, post: Post) {
    const { text, type = 'md', image } = post;
    const mainContent: { text: string; type: string; image?: Post['image'] } = {
      text,
      type,
    };
    if (image) {
      mainContent.image = image;
    }

    return this.set({
      signerId,
      data: {
        [signerId]: {
          post: {
            main: JSON.stringify(mainContent),
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

  async createComment(signerId: string, comment: Comment) {
    const { item, text, image } = comment;
    const commentContent: {
      item: CommentItem;
      text: string;
      type: string;
      image?: Comment['image'];
    } = {
      item,
      text,
      type: 'md',
    };
    if (image) {
      commentContent.image = image;
    }

    return this.set({
      signerId,
      data: {
        [signerId]: {
          post: {
            comment: JSON.stringify(commentContent),
          },
          index: {
            comment: JSON.stringify({
              key: item,
              value: {
                type: 'md',
              },
            }),
          },
        },
      },
    });
  }

  async getComments(item: CommentItem): Promise<unknown[]> {
    return this.index({
      action: 'comment',
      key: item,
    });
  }

  async getFollowers(accountId: string): Promise<unknown[]> {
    const result = await this.keys({
      keys: [`*/graph/follow/${accountId}`],
      returnType: 'BlockHeight',
      valuesOnly: true,
    });

    if (!result) return [];

    const followers: unknown[] = [];
    for (const followerId in result) {
      if (followerId !== accountId) {
        followers.push({ accountId: followerId });
      }
    }

    return followers;
  }

  async getFollowing(
    accountId: string
  ): Promise<Record<string, unknown> | null> {
    const result = await this.get({
      keys: [`${accountId}/graph/follow/**`],
    });

    if (!result) return null;

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
