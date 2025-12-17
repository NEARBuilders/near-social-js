import { Graph } from './graph';
import type {
  GraphOptions,
  IndexOptions,
  Profile,
  Post,
  CommentItem,
  Comment,
  FeedOptions,
  AccountFeedOptions,
  IndexEntry,
  Notification,
} from './types';
import { extractMentions, extractHashtags } from './utils';

export type SocialOptions = GraphOptions;

export class Social extends Graph {
  constructor(options?: SocialOptions) {
    super(options);
  }

  // ============================================
  // Profile Methods
  // ============================================

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

  // ============================================
  // Post Methods
  // ============================================

  /**
   * Get a post by account ID and block height.
   * @param accountId - The account that created the post
   * @param blockHeight - The block height when the post was created
   * @param options - Optional settings
   * @param options.comments - If true, also fetch comments for this post
   * @returns The post data, optionally with comments
   */
  async getPost(
    accountId: string,
    blockHeight: number,
    options?: { comments?: boolean }
  ): Promise<(Post & { comments?: IndexEntry[] }) | null> {
    const result = await this.get({
      keys: [`${accountId}/post/main`],
      blockHeight: BigInt(blockHeight),
    });

    if (!result) return null;

    const accountData = result[accountId] as
      | { post?: { main?: string } }
      | undefined;
    const mainData = accountData?.post?.main;

    if (!mainData) return null;

    // Parse the JSON stringified post content
    let post: Post;
    try {
      post = typeof mainData === 'string' ? JSON.parse(mainData) : mainData;
    } catch {
      post = mainData as unknown as Post;
    }

    // Optionally fetch comments
    if (options?.comments) {
      const item: CommentItem = {
        type: 'social',
        path: `${accountId}/post/main`,
        blockHeight,
      };
      const comments = await this.getComments(item);
      return { ...post, comments: comments as IndexEntry[] };
    }

    return post;
  }

  /**
   * Create a new post with automatic mention and hashtag extraction.
   * Mentions (@account.near) will trigger notifications.
   * Hashtags (#topic) will be indexed for discovery.
   */
  async createPost(signerId: string, post: Post) {
    const { text, type = 'md', image } = post;

    // Extract mentions and hashtags
    const mentions = extractMentions(text);
    const hashtags = extractHashtags(text);

    const mainContent: { text: string; type: string; image?: Post['image'] } = {
      text,
      type,
    };
    if (image) {
      mainContent.image = image;
    }

    // Build the data structure
    const data: Record<string, Record<string, unknown>> = {
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
    };

    // Add hashtag indexing if hashtags exist
    if (hashtags.length > 0) {
      const hashtagIndexes = hashtags.map((tag) => ({
        key: tag,
        value: {
          type: 'hashtag',
          path: `${signerId}/post/main`,
        },
      }));
      data[signerId].index = {
        ...(data[signerId].index as Record<string, unknown>),
        hashtag: JSON.stringify(
          hashtagIndexes.length === 1 ? hashtagIndexes[0] : hashtagIndexes
        ),
      };
    }

    // Add notifications for mentions
    if (mentions.length > 0) {
      for (const mentionedAccount of mentions) {
        if (mentionedAccount !== signerId) {
          data[mentionedAccount] = {
            index: {
              notify: JSON.stringify({
                // Notifications are indexed under the recipient accountId
                // so they can be fetched via `getNotifications(recipient)` /
                // `getMentionedFeed(recipient)`.
                key: mentionedAccount,
                value: {
                  type: 'mention',
                  accountId: signerId,
                  item: {
                    type: 'social',
                    path: `${signerId}/post/main`,
                    // blockHeight will be set by the contract
                  },
                },
              }),
            },
          };
        }
      }
    }

    return this.set({
      signerId,
      data,
    });
  }

  // ============================================
  // Comment Methods
  // ============================================

  /**
   * Create a comment on a post with automatic mention and hashtag extraction.
   */
  async createComment(signerId: string, comment: Comment) {
    const { item, text, image } = comment;

    // Extract mentions and hashtags
    const mentions = extractMentions(text);
    const hashtags = extractHashtags(text);

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

    // Build the data structure
    const data: Record<string, Record<string, unknown>> = {
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
    };

    // Add hashtag indexing if hashtags exist
    if (hashtags.length > 0) {
      const hashtagIndexes = hashtags.map((tag) => ({
        key: tag,
        value: {
          type: 'hashtag',
          path: `${signerId}/post/comment`,
        },
      }));
      data[signerId].index = {
        ...(data[signerId].index as Record<string, unknown>),
        hashtag: JSON.stringify(
          hashtagIndexes.length === 1 ? hashtagIndexes[0] : hashtagIndexes
        ),
      };
    }

    // Notify the post author about the comment
    const postAuthor = item.path.split('/')[0];
    if (postAuthor && postAuthor !== signerId) {
      data[postAuthor] = {
        index: {
          notify: JSON.stringify({
            key: postAuthor,
            value: {
              type: 'comment',
              accountId: signerId,
              item,
            },
          }),
        },
      };
    }

    // Add notifications for mentions
    if (mentions.length > 0) {
      for (const mentionedAccount of mentions) {
        if (mentionedAccount !== signerId && mentionedAccount !== postAuthor) {
          data[mentionedAccount] = {
            index: {
              notify: JSON.stringify({
                key: mentionedAccount,
                value: {
                  type: 'mention',
                  accountId: signerId,
                  item: {
                    type: 'social',
                    path: `${signerId}/post/comment`,
                  },
                },
              }),
            },
          };
        }
      }
    }

    return this.set({
      signerId,
      data,
    });
  }

  async getComments(item: CommentItem): Promise<IndexEntry[]> {
    return this.index({
      action: 'comment',
      key: item,
    }) as Promise<IndexEntry[]>;
  }

  // ============================================
  // Follow Methods
  // ============================================

  async getFollowers(accountId: string): Promise<{ accountId: string }[]> {
    const result = await this.keys({
      keys: [`*/graph/follow/${accountId}`],
      returnType: 'BlockHeight',
      valuesOnly: true,
    });

    if (!result) return [];

    const followers: { accountId: string }[] = [];
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
        // Notify the followed account
        [accountId]: {
          index: {
            notify: JSON.stringify({
              key: accountId,
              value: {
                type: 'follow',
                accountId: signerId,
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

  // ============================================
  // Like Methods
  // ============================================

  async like(signerId: string, item: CommentItem) {
    const postAuthor = item.path.split('/')[0];

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
        // Notify the post author about the like
        ...(postAuthor &&
          postAuthor !== signerId && {
            [postAuthor]: {
              index: {
                notify: JSON.stringify({
                  key: postAuthor,
                  value: {
                    type: 'like',
                    accountId: signerId,
                    item,
                  },
                }),
              },
            },
          }),
      },
    });
  }

  async getLikes(item: CommentItem): Promise<IndexEntry[]> {
    return this.index({
      action: 'like',
      key: item,
    }) as Promise<IndexEntry[]>;
  }

  async unlike(signerId: string, item: CommentItem) {
    return this.set({
      signerId,
      data: {
        [signerId]: {
          index: {
            like: JSON.stringify({
              key: item,
              value: {
                type: 'unlike',
              },
            }),
          },
        },
      },
    });
  }

  // ============================================
  // Repost Methods
  // ============================================

  async repost(signerId: string, item: CommentItem) {
    const postAuthor = item.path.split('/')[0];

    return this.set({
      signerId,
      data: {
        [signerId]: {
          index: {
            repost: JSON.stringify([
              { key: 'main', value: { type: 'repost', item } },
              { key: item, value: { type: 'repost' } },
            ]),
          },
        },
        // Notify the post author about the repost
        ...(postAuthor &&
          postAuthor !== signerId && {
            [postAuthor]: {
              index: {
                notify: JSON.stringify({
                  key: postAuthor,
                  value: {
                    type: 'repost',
                    accountId: signerId,
                    item,
                  },
                }),
              },
            },
          }),
      },
    });
  }

  async getReposts(item: CommentItem): Promise<IndexEntry[]> {
    return this.index({
      action: 'repost',
      key: item,
    }) as Promise<IndexEntry[]>;
  }

  // ============================================
  // Feed Methods
  // ============================================

  /**
   * Get posts from a specific account's feed.
   * @param accountId - The account to get posts from
   * @param options - Pagination and ordering options
   * @param options.includeReplies - If true, also include comments/replies made by the account
   */
  async getAccountFeed(
    accountId: string,
    options?: AccountFeedOptions
  ): Promise<IndexEntry[]> {
    const { includeReplies, ...feedOptions } = options ?? {};

    // Get posts
    const postsPromise = this.index({
      action: 'post',
      key: 'main',
      accountId,
      order: feedOptions?.order ?? 'desc',
      limit: feedOptions?.limit ?? 20,
      from: feedOptions?.from,
    } as IndexOptions);

    if (!includeReplies) {
      return postsPromise as Promise<IndexEntry[]>;
    }

    // If includeReplies is true, also fetch comments made by this account
    const commentsPromise = this.index({
      action: 'comment',
      key: 'main',
      accountId,
      order: feedOptions?.order ?? 'desc',
      limit: feedOptions?.limit ?? 20,
      from: feedOptions?.from,
    } as IndexOptions);

    const [posts, comments] = await Promise.all([postsPromise, commentsPromise]);

    // Merge and sort by blockHeight (descending by default)
    const combined = [...(posts as IndexEntry[]), ...(comments as IndexEntry[])];

    if (feedOptions?.order === 'asc') {
      combined.sort((a, b) => a.blockHeight - b.blockHeight);
    } else {
      combined.sort((a, b) => b.blockHeight - a.blockHeight);
    }

    // Apply limit after merge
    const limit = feedOptions?.limit ?? 20;
    return combined.slice(0, limit);
  }

  /**
   * Get posts tagged with a specific hashtag.
   * @param hashtag - The hashtag to search for (without #)
   * @param options - Pagination and ordering options
   */
  async getHashtagFeed(
    hashtag: string,
    options?: FeedOptions
  ): Promise<IndexEntry[]> {
    const indexOptions: IndexOptions = {
      action: 'hashtag',
      key: hashtag.toLowerCase().replace(/^#/, ''),
      order: options?.order ?? 'desc',
      limit: options?.limit ?? 20,
      from: options?.from,
    };

    return this.index(indexOptions) as Promise<IndexEntry[]>;
  }

  /**
   * Get the activity feed (all recent posts).
   * @param options - Pagination and ordering options
   */
  async getActivityFeed(options?: FeedOptions): Promise<IndexEntry[]> {
    const indexOptions: IndexOptions = {
      action: 'post',
      key: 'main',
      order: options?.order ?? 'desc',
      limit: options?.limit ?? 20,
      from: options?.from,
    };

    return this.index(indexOptions) as Promise<IndexEntry[]>;
  }

  /**
   * Get posts/comments where a specific account was mentioned.
   * @param accountId - The account to get mentions for
   * @param options - Pagination and ordering options
   */
  async getMentionedFeed(
    accountId: string,
    options?: FeedOptions
  ): Promise<Notification[]> {
    // Get notifications of type "mention" for this account
    const notifications = await this.index({
      action: 'notify',
      key: accountId,
      order: options?.order ?? 'desc',
      limit: options?.limit ?? 20,
      from: options?.from,
    });

    // Filter for mention type only
    return (notifications as Notification[]).filter(
      (n) => n.value?.type === 'mention'
    );
  }

  // ============================================
  // Notification Methods
  // ============================================

  /**
   * Get notifications for an account.
   * Includes mentions, likes, comments, follows, reposts.
   * @param accountId - The account to get notifications for
   * @param options - Pagination and ordering options
   */
  async getNotifications(
    accountId: string,
    options?: FeedOptions
  ): Promise<Notification[]> {
    const notifications = await this.index({
      action: 'notify',
      key: accountId,
      order: options?.order ?? 'desc',
      limit: options?.limit ?? 20,
      from: options?.from,
    });

    return notifications as Notification[];
  }

  /**
   * Send a notification to another account.
   * @param signerId - The sender account
   * @param targetAccountId - The account to notify
   * @param item - Optional item reference (post, comment, etc.)
   * @param type - The notification type (default: 'custom')
   */
  async notify(
    signerId: string,
    targetAccountId: string,
    item?: CommentItem,
    type: string = 'custom'
  ) {
    return this.set({
      signerId,
      data: {
        [targetAccountId]: {
          index: {
            notify: JSON.stringify({
              key: targetAccountId,
              value: {
                type,
                accountId: signerId,
                ...(item && { item }),
              },
            }),
          },
        },
      },
    });
  }

  // ============================================
  // Poke Method
  // ============================================

  /**
   * Poke another account (sends a simple notification).
   * @param signerId - The account doing the poking
   * @param targetAccountId - The account being poked
   */
  async poke(signerId: string, targetAccountId: string) {
    return this.set({
      signerId,
      data: {
        [signerId]: {
          index: {
            graph: JSON.stringify({
              key: 'poke',
              value: {
                accountId: targetAccountId,
              },
            }),
          },
        },
        [targetAccountId]: {
          index: {
            notify: JSON.stringify({
              key: targetAccountId,
              value: {
                type: 'poke',
                accountId: signerId,
              },
            }),
          },
        },
      },
    });
  }
}

// Re-export types for convenience
export type {
  Profile,
  Post,
  PostWithMetadata,
  CommentItem,
  Comment,
  FeedOptions,
  AccountFeedOptions,
  IndexEntry,
  Notification,
} from './types';
