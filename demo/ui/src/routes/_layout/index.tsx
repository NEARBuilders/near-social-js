import { createFileRoute, Link } from '@tanstack/react-router';
import { Database, Users, ArrowRight, Wallet } from 'lucide-react';
import { useWallet } from '../../integrations/near-wallet';
import { useProfile } from '../../integrations/near-social';
import { ProfileCard } from '../../components/profile-card';

export const Route = createFileRoute('/_layout/')({
  component: HomePage,
});

function HomePage() {
  const { accountId, connect } = useWallet();
  const { data: profile, isLoading } = useProfile(accountId ?? '', {
    enabled: !!accountId,
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl text-white">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">NEAR Social JS</h1>
        <p className="text-lg text-white/70 max-w-2xl mx-auto">
          A JavaScript SDK for interacting with the NEAR Social graph database
          contract with helper functions for typical social features.
        </p>
      </div>

      {accountId ? (
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          {isLoading ? (
            <div className="rounded-xl bg-white/5 border border-white/10 p-8 flex items-center justify-center">
              <div className="animate-pulse text-white/50">
                Loading profile...
              </div>
            </div>
          ) : (
            <ProfileCard
              accountId={accountId}
              profile={profile ?? null}
              isOwnProfile
            />
          )}
        </div>
      ) : (
        <div className="mb-12 rounded-xl bg-white/5 border border-white/10 p-8 text-center">
          <Wallet className="h-12 w-12 mx-auto mb-4 text-white/30" />
          <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-white/60 mb-6">
            Connect Wallet to view your profile and test write operations.
          </p>
          <button
            onClick={connect}
            className="px-6 py-3 rounded-lg bg-[#00EC97] text-black font-semibold hover:bg-[#00d084] transition-colors"
          >
            Connect
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Link
          to="/graph"
          className="group rounded-xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all hover:border-[#00EC97]/30"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-[#00EC97]/10">
              <Database className="h-6 w-6 text-[#00EC97]" />
            </div>
            <h3 className="text-xl font-semibold">Graph Methods</h3>
          </div>
          <p className="text-white/60 mb-4">
            Low-level methods for interacting with the social graph contract.
            Query data, manage storage, and write directly to the graph.
          </p>
          <ul className="text-sm text-white/50 space-y-1 mb-4">
            <li>• get() - Fetch data by key patterns</li>
            <li>• keys() - List keys matching patterns</li>
            <li>• index() - Query indexed data</li>
            <li>• set() - Write data to the graph</li>
          </ul>
          <div className="flex items-center text-[#00EC97] font-medium group-hover:gap-3 gap-2 transition-all">
            Explore Graph Methods
            <ArrowRight className="h-4 w-4" />
          </div>
        </Link>

        <Link
          to="/social"
          className="group rounded-xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all hover:border-[#00EC97]/30"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-[#3D7FFF]/10">
              <Users className="h-6 w-6 text-[#3D7FFF]" />
            </div>
            <h3 className="text-xl font-semibold">Social Methods</h3>
          </div>
          <p className="text-white/60 mb-4">
            High-level social features built on top of the graph. Profiles,
            follows, posts, and likes with visual previews.
          </p>
          <ul className="text-sm text-white/50 space-y-1 mb-4">
            <li>• getProfile() / setProfile()</li>
            <li>• follow() / unfollow()</li>
            <li>• getFollowers() / getFollowing()</li>
            <li>• createPost() / like()</li>
          </ul>
          <div className="flex items-center text-[#3D7FFF] font-medium group-hover:gap-3 gap-2 transition-all">
            Explore Social Methods
            <ArrowRight className="h-4 w-4" />
          </div>
        </Link>
      </div>

      <div className="mt-12 text-center">
        <p className="text-white/40 text-sm">
          Built by{' '}
          <a
            href="https://github.com/NEARBuilders"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00EC97] hover:underline"
          >
            NEAR Builders
          </a>
        </p>
      </div>
    </div>
  );
}
