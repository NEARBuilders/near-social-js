import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { useWallet } from '../../integrations/near-wallet';
import {
  useProfile,
  useFollowers,
  useFollowing,
  useFollow,
  useUnfollow,
  useSetProfile,
  useSocialInstance,
  useCreatePost,
  useLike,
  useUnlike,
  useCreateComment,
  useRepost,
  usePoke,
  useNotify,
} from '../../integrations/near-social';
import { ProfileCard } from '../../components/profile-card';
import { ProfileAvatar } from '../../components/profile-avatar';
import { ResponsePanel } from '../../components/response-panel';
import { MethodCard } from '../../components/method-card';
import { Search, Loader2 } from 'lucide-react';

export const Route = createFileRoute('/_layout/social')({
  component: SocialPage,
});

function SocialPage() {
  const { accountId } = useWallet();
  const [viewMode, setViewMode] = useState<'pretty' | 'json'>('pretty');
  const [lookupAccountId, setLookupAccountId] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [response, setResponse] = useState<unknown>(null);

  const profileQuery = useProfile(lookupAccountId);
  const followersQuery = useFollowers(lookupAccountId);
  const followingQuery = useFollowing(lookupAccountId);
  const followMutation = useFollow(lookupAccountId);
  const unfollowMutation = useUnfollow(lookupAccountId);
  const setProfileMutation = useSetProfile();
  const social = useSocialInstance();
  const createPostMutation = useCreatePost();
  const likeMutation = useLike();
  const unlikeMutation = useUnlike();
  const createCommentMutation = useCreateComment();
  const repostMutation = useRepost();
  const pokeMutation = usePoke();
  const notifyMutation = useNotify();

  const handleLookup = () => {
    if (!searchInput) return;
    setLookupAccountId(searchInput);
  };

  const loading =
    profileQuery.isLoading ||
    followersQuery.isLoading ||
    followingQuery.isLoading;
  const lookupProfile = profileQuery.data ?? null;
  const lookupFollowers = (followersQuery.data ?? []) as unknown[];
  const lookupFollowing = (followingQuery.data ?? {}) as Record<
    string,
    unknown
  >;

  const isFollowing = accountId
    ? Object.keys(lookupFollowing).includes(accountId)
    : false;

  const debugResponse = useMemo(() => {
    if (!lookupAccountId) return null;
    return {
      profile: profileQuery.data ?? profileQuery.error?.message ?? null,
      followers: followersQuery.data ?? followersQuery.error?.message ?? [],
      following: followingQuery.data ?? followingQuery.error?.message ?? {},
      ...(followMutation.data && { lastFollowResult: followMutation.data }),
      ...(followMutation.error && {
        lastFollowError: (followMutation.error as Error).message,
      }),
      ...(unfollowMutation.data && {
        lastUnfollowResult: unfollowMutation.data,
      }),
      ...(unfollowMutation.error && {
        lastUnfollowError: (unfollowMutation.error as Error).message,
      }),
    };
  }, [
    lookupAccountId,
    profileQuery,
    followersQuery,
    followingQuery,
    followMutation,
    unfollowMutation,
  ]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Social Methods</h1>
        <p className="text-white/60">
          High-level social features with visual previews.
        </p>
      </div>

      <div className="rounded-xl bg-white/5 border border-white/10 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Profile Lookup</h2>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              placeholder="Enter account ID (e.g., alice.near)"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#3D7FFF]/50"
            />
          </div>
          <button
            onClick={handleLookup}
            disabled={loading || !searchInput}
            className="px-6 py-3 rounded-lg bg-[#3D7FFF] text-white font-semibold hover:bg-[#2a6aee] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-5 w-5" />
            )}
            Lookup
          </button>
        </div>
      </div>

      {lookupProfile && (
        <div className="space-y-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Profile Data</h2>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
              <button
                onClick={() => setViewMode('pretty')}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
                  viewMode === 'pretty'
                    ? 'bg-[#3D7FFF] text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Pretty
              </button>
              <button
                onClick={() => setViewMode('json')}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
                  viewMode === 'json'
                    ? 'bg-[#3D7FFF] text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                JSON
              </button>
            </div>
          </div>

          {viewMode === 'pretty' ? (
            <>
              <ProfileCard
                accountId={lookupAccountId}
                profile={lookupProfile}
                isOwnProfile={accountId === lookupAccountId}
                isFollowing={isFollowing}
                onFollow={accountId ? () => followMutation.mutate() : undefined}
                onUnfollow={
                  accountId ? () => unfollowMutation.mutate() : undefined
                }
                onEditProfile={
                  accountId === lookupAccountId
                    ? async (profile) => {
                        await setProfileMutation.mutateAsync(profile);
                      }
                    : undefined
                }
                isEditLoading={setProfileMutation.isPending}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <h3 className="text-sm font-semibold text-white/70 mb-3">
                    Followers ({lookupFollowers.length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-auto">
                    {lookupFollowers.slice(0, 10).map((follower: unknown) => {
                      const f = follower as {
                        accountId?: string;
                        account_id?: string;
                      };
                      const id = f.accountId || f.account_id || '';
                      return (
                        <button
                          key={id}
                          onClick={() => {
                            setSearchInput(id);
                            setLookupAccountId(id);
                          }}
                          className="w-full text-left hover:bg-white/5 rounded-lg p-2 transition-colors cursor-pointer"
                        >
                          <ProfileAvatar accountId={id} size="sm" />
                        </button>
                      );
                    })}
                    {lookupFollowers.length === 0 && (
                      <p className="text-white/40 text-sm">No followers</p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <h3 className="text-sm font-semibold text-white/70 mb-3">
                    Following ({Object.keys(lookupFollowing).length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-auto">
                    {Object.keys(lookupFollowing)
                      .slice(0, 10)
                      .map((followingId) => (
                        <button
                          key={followingId}
                          onClick={() => {
                            setSearchInput(followingId);
                            setLookupAccountId(followingId);
                          }}
                          className="w-full text-left hover:bg-white/5 rounded-lg p-2 transition-colors cursor-pointer"
                        >
                          <ProfileAvatar accountId={followingId} size="sm" />
                        </button>
                      ))}
                    {Object.keys(lookupFollowing).length === 0 && (
                      <p className="text-white/40 text-sm">
                        Not following anyone
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <ResponsePanel
              data={debugResponse}
              variant="inline"
              title="Debug Data"
            />
          )}
        </div>
      )}

      {!lookupProfile && !loading && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-12 text-center mb-8">
          <Search className="h-12 w-12 mx-auto mb-4 text-white/20" />
          <p className="text-white/40">
            Enter an account ID above to lookup their profile
          </p>
        </div>
      )}

      <div className="mb-8 pt-8 border-t border-white/10">
        <h2 className="text-2xl font-bold mb-2">Additional Methods</h2>
        <p className="text-white/60 mb-6">
          Test individual social methods directly.
        </p>

        <div className="grid gap-4 pb-[300px] md:pb-[250px]">
          {/* Post Methods */}
          <h3 className="text-lg font-semibold text-white/80 mt-4">Posts</h3>

          <MethodCard
            name="getPost"
            description="Get a post by account ID and block height (optionally with comments)"
            fields={[
              {
                name: 'accountId',
                label: 'Account ID',
                type: 'text' as const,
                placeholder: 'alice.near',
                required: true,
              },
              {
                name: 'blockHeight',
                label: 'Block Height',
                type: 'number' as const,
                placeholder: '12345678',
                required: true,
              },
              {
                name: 'includeComments',
                label: 'Include Comments',
                type: 'text' as const,
                placeholder: 'true or false',
                required: false,
              },
            ]}
            requiresWallet={false}
            isConnected={!!accountId}
            onExecute={async (params: Record<string, string>) => {
              return social.getPost(
                params.accountId,
                parseInt(params.blockHeight),
                { comments: params.includeComments === 'true' }
              );
            }}
            onResult={setResponse}
          />

          <MethodCard
            name="createPost"
            description="Create a new post with auto-extraction of @mentions and #hashtags"
            fields={[
              {
                name: 'content',
                label: 'Post Content',
                type: 'textarea' as const,
                placeholder: 'Hello @alice.near! Check out #near #blockchain',
                required: true,
              },
              {
                name: 'imageUrl',
                label: 'Image URL (optional)',
                type: 'text' as const,
                placeholder: 'https://example.com/image.png',
                required: false,
              },
              {
                name: 'imageCid',
                label: 'Image IPFS CID (optional)',
                type: 'text' as const,
                placeholder: 'bafybei...',
                required: false,
              },
            ]}
            requiresWallet={true}
            isConnected={!!accountId}
            onExecute={async (params: Record<string, string>) => {
              if (!accountId) throw new Error('Wallet not connected');
              const post: {
                text: string;
                type?: string;
                image?: { ipfs_cid?: string; url?: string };
              } = {
                text: params.content,
                type: 'md',
              };
              if (params.imageUrl || params.imageCid) {
                post.image = {
                  ...(params.imageUrl && { url: params.imageUrl }),
                  ...(params.imageCid && { ipfs_cid: params.imageCid }),
                };
              }
              return createPostMutation.mutateAsync(post);
            }}
            onResult={setResponse}
          />

          {/* Comment Methods */}
          <h3 className="text-lg font-semibold text-white/80 mt-4">Comments</h3>

          <MethodCard
            name="createComment"
            description="Create a comment on a post with auto-extraction of @mentions and #hashtags"
            fields={[
              {
                name: 'itemType',
                label: 'Item Type',
                type: 'text' as const,
                placeholder: 'social',
                required: true,
              },
              {
                name: 'itemPath',
                label: 'Item Path',
                type: 'text' as const,
                placeholder: 'alice.near/post/main',
                required: true,
              },
              {
                name: 'itemBlockHeight',
                label: 'Item Block Height',
                type: 'number' as const,
                placeholder: '12345678',
                required: true,
              },
              {
                name: 'text',
                label: 'Comment Text',
                type: 'textarea' as const,
                placeholder: 'Great post @alice.near! #awesome',
                required: true,
              },
              {
                name: 'imageUrl',
                label: 'Image URL (optional)',
                type: 'text' as const,
                placeholder: 'https://example.com/image.png',
                required: false,
              },
              {
                name: 'imageCid',
                label: 'Image IPFS CID (optional)',
                type: 'text' as const,
                placeholder: 'bafybei...',
                required: false,
              },
            ]}
            requiresWallet={true}
            isConnected={!!accountId}
            onExecute={async (params: Record<string, string>) => {
              if (!accountId) throw new Error('Wallet not connected');
              const comment: {
                item: { type: string; path: string; blockHeight: number };
                text: string;
                image?: { ipfs_cid?: string; url?: string };
              } = {
                item: {
                  type: params.itemType,
                  path: params.itemPath,
                  blockHeight: parseInt(params.itemBlockHeight),
                },
                text: params.text,
              };
              if (params.imageUrl || params.imageCid) {
                comment.image = {
                  ...(params.imageUrl && { url: params.imageUrl }),
                  ...(params.imageCid && { ipfs_cid: params.imageCid }),
                };
              }
              return createCommentMutation.mutateAsync(comment);
            }}
            onResult={setResponse}
          />

          <MethodCard
            name="getComments"
            description="Get comments for a post or item"
            fields={[
              {
                name: 'type',
                label: 'Type',
                type: 'text' as const,
                placeholder: 'social',
                required: true,
              },
              {
                name: 'path',
                label: 'Path',
                type: 'text' as const,
                placeholder: 'alice.near/post/main',
                required: true,
              },
              {
                name: 'blockHeight',
                label: 'Block Height',
                type: 'number' as const,
                placeholder: '12345678',
                required: true,
              },
            ]}
            requiresWallet={false}
            isConnected={!!accountId}
            onExecute={async (params: Record<string, string>) => {
              return social.getComments({
                type: params.type,
                path: params.path,
                blockHeight: parseInt(params.blockHeight),
              });
            }}
            onResult={setResponse}
          />

          {/* Like Methods */}
          <h3 className="text-lg font-semibold text-white/80 mt-4">Likes</h3>

          <MethodCard
            name="like"
            description="Like a post or item (requires wallet)"
            fields={[
              {
                name: 'type',
                label: 'Type',
                type: 'text' as const,
                placeholder: 'social',
                required: true,
              },
              {
                name: 'path',
                label: 'Path',
                type: 'text' as const,
                placeholder: 'alice.near/post/main',
                required: true,
              },
              {
                name: 'blockHeight',
                label: 'Block Height',
                type: 'number' as const,
                placeholder: '12345678',
                required: true,
              },
            ]}
            requiresWallet={true}
            isConnected={!!accountId}
            onExecute={async (params: Record<string, string>) => {
              if (!accountId) throw new Error('Wallet not connected');
              return likeMutation.mutateAsync({
                type: params.type,
                path: params.path,
                blockHeight: parseInt(params.blockHeight),
              });
            }}
            onResult={setResponse}
          />

          <MethodCard
            name="getLikes"
            description="Get likes for a post or item"
            fields={[
              {
                name: 'type',
                label: 'Type',
                type: 'text' as const,
                placeholder: 'social',
                required: true,
              },
              {
                name: 'path',
                label: 'Path',
                type: 'text' as const,
                placeholder: 'alice.near/post/main',
                required: true,
              },
              {
                name: 'blockHeight',
                label: 'Block Height',
                type: 'number' as const,
                placeholder: '12345678',
                required: true,
              },
            ]}
            requiresWallet={false}
            isConnected={!!accountId}
            onExecute={async (params: Record<string, string>) => {
              return social.getLikes({
                type: params.type,
                path: params.path,
                blockHeight: parseInt(params.blockHeight),
              });
            }}
            onResult={setResponse}
          />

          <MethodCard
            name="unlike"
            description="Unlike a previously liked post or item (requires wallet)"
            fields={[
              {
                name: 'type',
                label: 'Type',
                type: 'text' as const,
                placeholder: 'social',
                required: true,
              },
              {
                name: 'path',
                label: 'Path',
                type: 'text' as const,
                placeholder: 'alice.near/post/main',
                required: true,
              },
              {
                name: 'blockHeight',
                label: 'Block Height',
                type: 'number' as const,
                placeholder: '12345678',
                required: true,
              },
            ]}
            requiresWallet={true}
            isConnected={!!accountId}
            onExecute={async (params: Record<string, string>) => {
              if (!accountId) throw new Error('Wallet not connected');
              return unlikeMutation.mutateAsync({
                type: params.type,
                path: params.path,
                blockHeight: parseInt(params.blockHeight),
              });
            }}
            onResult={setResponse}
          />

          {/* Repost Methods */}
          <h3 className="text-lg font-semibold text-white/80 mt-4">Reposts</h3>

          <MethodCard
            name="repost"
            description="Repost a post to your feed (requires wallet)"
            fields={[
              {
                name: 'type',
                label: 'Item Type',
                type: 'text' as const,
                placeholder: 'social',
                required: true,
              },
              {
                name: 'path',
                label: 'Item Path',
                type: 'text' as const,
                placeholder: 'alice.near/post/main',
                required: true,
              },
              {
                name: 'blockHeight',
                label: 'Item Block Height',
                type: 'number' as const,
                placeholder: '12345678',
                required: true,
              },
            ]}
            requiresWallet={true}
            isConnected={!!accountId}
            onExecute={async (params: Record<string, string>) => {
              if (!accountId) throw new Error('Wallet not connected');
              return repostMutation.mutateAsync({
                type: params.type,
                path: params.path,
                blockHeight: parseInt(params.blockHeight),
              });
            }}
            onResult={setResponse}
          />

          <MethodCard
            name="getReposts"
            description="Get reposts for a post or item"
            fields={[
              {
                name: 'type',
                label: 'Type',
                type: 'text' as const,
                placeholder: 'social',
                required: true,
              },
              {
                name: 'path',
                label: 'Path',
                type: 'text' as const,
                placeholder: 'alice.near/post/main',
                required: true,
              },
              {
                name: 'blockHeight',
                label: 'Block Height',
                type: 'number' as const,
                placeholder: '12345678',
                required: true,
              },
            ]}
            requiresWallet={false}
            isConnected={!!accountId}
            onExecute={async (params: Record<string, string>) => {
              return social.getReposts({
                type: params.type,
                path: params.path,
                blockHeight: parseInt(params.blockHeight),
              });
            }}
            onResult={setResponse}
          />

          {/* Feed Methods */}
          <h3 className="text-lg font-semibold text-white/80 mt-4">Feeds</h3>

          <MethodCard
            name="getAccountFeed"
            description="Get posts from a specific account's feed (optionally with replies)"
            fields={[
              {
                name: 'accountId',
                label: 'Account ID',
                type: 'text' as const,
                placeholder: 'alice.near',
                required: true,
              },
              {
                name: 'limit',
                label: 'Limit',
                type: 'number' as const,
                placeholder: '20',
                required: false,
              },
              {
                name: 'includeReplies',
                label: 'Include Replies',
                type: 'text' as const,
                placeholder: 'true or false',
                required: false,
              },
            ]}
            requiresWallet={false}
            isConnected={!!accountId}
            onExecute={async (params: Record<string, string>) => {
              return social.getAccountFeed(params.accountId, {
                limit: params.limit ? parseInt(params.limit) : 20,
                includeReplies: params.includeReplies === 'true',
              });
            }}
            onResult={setResponse}
          />

          <MethodCard
            name="getHashtagFeed"
            description="Get posts tagged with a specific hashtag"
            fields={[
              {
                name: 'hashtag',
                label: 'Hashtag',
                type: 'text' as const,
                placeholder: 'near',
                required: true,
              },
              {
                name: 'limit',
                label: 'Limit',
                type: 'number' as const,
                placeholder: '20',
                required: false,
              },
            ]}
            requiresWallet={false}
            isConnected={!!accountId}
            onExecute={async (params: Record<string, string>) => {
              return social.getHashtagFeed(params.hashtag, {
                limit: params.limit ? parseInt(params.limit) : 20,
              });
            }}
            onResult={setResponse}
          />

          <MethodCard
            name="getActivityFeed"
            description="Get all recent posts (activity feed)"
            fields={[
              {
                name: 'limit',
                label: 'Limit',
                type: 'number' as const,
                placeholder: '20',
                required: false,
              },
            ]}
            requiresWallet={false}
            isConnected={!!accountId}
            onExecute={async (params: Record<string, string>) => {
              return social.getActivityFeed({
                limit: params.limit ? parseInt(params.limit) : 20,
              });
            }}
            onResult={setResponse}
          />

          <MethodCard
            name="getMentionedFeed"
            description="Get posts/comments where an account was mentioned"
            fields={[
              {
                name: 'accountId',
                label: 'Account ID',
                type: 'text' as const,
                placeholder: 'alice.near',
                required: true,
              },
              {
                name: 'limit',
                label: 'Limit',
                type: 'number' as const,
                placeholder: '20',
                required: false,
              },
            ]}
            requiresWallet={false}
            isConnected={!!accountId}
            onExecute={async (params: Record<string, string>) => {
              return social.getMentionedFeed(params.accountId, {
                limit: params.limit ? parseInt(params.limit) : 20,
              });
            }}
            onResult={setResponse}
          />

          {/* Notification Methods */}
          <h3 className="text-lg font-semibold text-white/80 mt-4">
            Notifications
          </h3>

          <MethodCard
            name="getNotifications"
            description="Get notifications for an account (mentions, likes, comments, follows, reposts)"
            fields={[
              {
                name: 'accountId',
                label: 'Account ID',
                type: 'text' as const,
                placeholder: 'alice.near',
                required: true,
              },
              {
                name: 'limit',
                label: 'Limit',
                type: 'number' as const,
                placeholder: '20',
                required: false,
              },
            ]}
            requiresWallet={false}
            isConnected={!!accountId}
            onExecute={async (params: Record<string, string>) => {
              return social.getNotifications(params.accountId, {
                limit: params.limit ? parseInt(params.limit) : 20,
              });
            }}
            onResult={setResponse}
          />

          <MethodCard
            name="notify"
            description="Send a notification to another account (requires wallet)"
            fields={[
              {
                name: 'targetAccountId',
                label: 'Target Account ID',
                type: 'text' as const,
                placeholder: 'bob.near',
                required: true,
              },
              {
                name: 'type',
                label: 'Notification Type',
                type: 'text' as const,
                placeholder: 'custom',
                required: false,
              },
            ]}
            requiresWallet={true}
            isConnected={!!accountId}
            onExecute={async (params: Record<string, string>) => {
              if (!accountId) throw new Error('Wallet not connected');
              return notifyMutation.mutateAsync({
                targetAccountId: params.targetAccountId,
                type: params.type || 'custom',
              });
            }}
            onResult={setResponse}
          />

          {/* Poke Method */}
          <h3 className="text-lg font-semibold text-white/80 mt-4">Poke</h3>

          <MethodCard
            name="poke"
            description="Poke another account (sends a simple notification)"
            fields={[
              {
                name: 'targetAccountId',
                label: 'Target Account ID',
                type: 'text' as const,
                placeholder: 'bob.near',
                required: true,
              },
            ]}
            requiresWallet={true}
            isConnected={!!accountId}
            onExecute={async (params: Record<string, string>) => {
              if (!accountId) throw new Error('Wallet not connected');
              return pokeMutation.mutateAsync(params.targetAccountId);
            }}
            onResult={setResponse}
          />
        </div>
      </div>

      {response !== null && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/95 via-black/90 to-transparent pt-8 pb-4 px-4 md:px-8">
          <div className="container mx-auto max-w-4xl">
            <ResponsePanel data={response} variant="fixed" />
          </div>
        </div>
      )}
    </div>
  );
}
