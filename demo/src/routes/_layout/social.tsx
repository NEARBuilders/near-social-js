import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Social } from 'near-social-js'
import { useWallet } from '../../integrations/near-wallet'
import { ProfileCard } from '../../components/profile-card'
import { ProfileAvatar } from '../../components/profile-avatar'
import { ResponsePanel } from '../../components/response-panel'
import { Search, Eye, Code, Loader2 } from 'lucide-react'

export const Route = createFileRoute('/_layout/social')({
  component: SocialPage,
})

function SocialPage() {
  const queryClient = useQueryClient()
  const { accountId, social: walletSocial } = useWallet()
  const [viewMode, setViewMode] = useState<'pretty' | 'debug'>('pretty')
  const [lookupAccountId, setLookupAccountId] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const social = useMemo(
    () => walletSocial ?? new Social({ network: 'mainnet' }),
    [walletSocial]
  )

  const profileQuery = useQuery({
    queryKey: ['social', 'profile', lookupAccountId],
    queryFn: () => social.getProfile(lookupAccountId),
    enabled: !!lookupAccountId,
  })

  const followersQuery = useQuery({
    queryKey: ['social', 'followers', lookupAccountId],
    queryFn: () => social.getFollowers(lookupAccountId),
    enabled: !!lookupAccountId,
  })

  const followingQuery = useQuery({
    queryKey: ['social', 'following', lookupAccountId],
    queryFn: () => social.getFollowing(lookupAccountId),
    enabled: !!lookupAccountId,
  })

  const followMutation = useMutation({
    mutationFn: () => {
      if (!accountId || !walletSocial || !lookupAccountId) {
        throw new Error('Wallet not connected')
      }
      return walletSocial.follow(accountId, lookupAccountId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social', 'followers', lookupAccountId] })
      queryClient.invalidateQueries({ queryKey: ['social', 'following'] })
    },
  })

  const unfollowMutation = useMutation({
    mutationFn: () => {
      if (!accountId || !walletSocial || !lookupAccountId) {
        throw new Error('Wallet not connected')
      }
      return walletSocial.unfollow(accountId, lookupAccountId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social', 'followers', lookupAccountId] })
      queryClient.invalidateQueries({ queryKey: ['social', 'following'] })
    },
  })

  const handleLookup = () => {
    if (!searchInput) return
    setLookupAccountId(searchInput)
  }

  const loading = profileQuery.isLoading || followersQuery.isLoading || followingQuery.isLoading
  const lookupProfile = profileQuery.data ?? null
  const lookupFollowers = followersQuery.data ?? []
  const lookupFollowing = followingQuery.data ?? {}

  const isFollowing = accountId
    ? Object.keys(lookupFollowing).includes(accountId)
    : false

  const debugResponse = lookupAccountId
    ? {
        profile: profileQuery.data ?? profileQuery.error?.message ?? null,
        followers: followersQuery.data ?? followersQuery.error?.message ?? [],
        following: followingQuery.data ?? followingQuery.error?.message ?? {},
        ...(followMutation.data && { lastFollowResult: followMutation.data }),
        ...(followMutation.error && { lastFollowError: (followMutation.error as Error).message }),
        ...(unfollowMutation.data && { lastUnfollowResult: unfollowMutation.data }),
        ...(unfollowMutation.error && { lastUnfollowError: (unfollowMutation.error as Error).message }),
      }
    : null

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background:
          'radial-gradient(ellipse at top left, rgba(61, 127, 255, 0.15) 0%, rgba(10, 20, 40, 0.8) 50%, #0d1117 100%)',
      }}
    >
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Social Methods</h1>
            <p className="text-white/60">
              High-level social features with visual previews.
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
            <button
              onClick={() => setViewMode('pretty')}
              className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors ${
                viewMode === 'pretty'
                  ? 'bg-[#3D7FFF] text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Eye className="h-4 w-4" />
              Pretty
            </button>
            <button
              onClick={() => setViewMode('debug')}
              className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors ${
                viewMode === 'debug'
                  ? 'bg-[#3D7FFF] text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Code className="h-4 w-4" />
              Debug
            </button>
          </div>
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

        {lookupProfile && viewMode === 'pretty' && (
          <div className="space-y-6 mb-6">
            <ProfileCard
              accountId={lookupAccountId}
              profile={lookupProfile}
              isOwnProfile={accountId === lookupAccountId}
              isFollowing={isFollowing}
              onFollow={accountId ? () => followMutation.mutate() : undefined}
              onUnfollow={accountId ? () => unfollowMutation.mutate() : undefined}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <h3 className="text-sm font-semibold text-white/70 mb-3">
                  Followers ({lookupFollowers.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-auto">
                  {lookupFollowers.slice(0, 10).map((follower: unknown) => {
                    const f = follower as { accountId?: string; account_id?: string }
                    const id = f.accountId || f.account_id || ''
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          setSearchInput(id)
                          setLookupAccountId(id)
                        }}
                        className="w-full text-left hover:bg-white/5 rounded-lg p-2 transition-colors"
                      >
                        <ProfileAvatar accountId={id} size="sm" />
                      </button>
                    )
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
                          setSearchInput(followingId)
                          setLookupAccountId(followingId)
                        }}
                        className="w-full text-left hover:bg-white/5 rounded-lg p-2 transition-colors"
                      >
                        <ProfileAvatar accountId={followingId} size="sm" />
                      </button>
                    ))}
                  {Object.keys(lookupFollowing).length === 0 && (
                    <p className="text-white/40 text-sm">Not following anyone</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {debugResponse !== null && viewMode === 'debug' && (
          <ResponsePanel data={debugResponse} />
        )}

        {!lookupProfile && !loading && (
          <div className="rounded-xl bg-white/5 border border-white/10 p-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-white/20" />
            <p className="text-white/40">
              Enter an account ID above to lookup their profile
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
