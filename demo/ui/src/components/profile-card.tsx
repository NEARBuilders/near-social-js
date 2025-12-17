import type { Profile } from 'near-social-js';
import { ProfileAvatar } from './profile-avatar';
import { ProfileEditDialog } from './profile-edit-dialog';
import { ExternalLink } from 'lucide-react';

interface ProfileCardProps {
  accountId: string;
  profile: Profile | null;
  isOwnProfile?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
  isFollowing?: boolean;
  onEditProfile?: (profile: Partial<Profile>) => Promise<void>;
  isEditLoading?: boolean;
}

export function ProfileCard({
  accountId,
  profile,
  isOwnProfile,
  onFollow,
  onUnfollow,
  isFollowing,
  onEditProfile,
  isEditLoading,
}: ProfileCardProps) {
  const backgroundUrl = profile?.backgroundImage?.ipfs_cid
    ? `https://ipfs.near.social/ipfs/${profile.backgroundImage.ipfs_cid}`
    : profile?.backgroundImage?.url;

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
      <div
        className="h-24 bg-gradient-to-r from-[#00EC97]/20 to-[#3D7FFF]/20"
        style={
          backgroundUrl
            ? {
                backgroundImage: `url(${backgroundUrl})`,
                backgroundSize: 'cover',
              }
            : undefined
        }
      />

      <div className="p-4 -mt-8">
        <ProfileAvatar
          accountId={accountId}
          profile={profile}
          size="lg"
          showName={false}
        />

        <div className="mt-3">
          <h3 className="text-lg font-semibold text-white">
            {profile?.name || accountId}
          </h3>
          <p className="text-sm text-white/50 font-mono">{accountId}</p>
        </div>

        {profile?.description && (
          <p className="mt-3 text-sm text-white/70">{profile.description}</p>
        )}

        {profile?.linktree && Object.keys(profile.linktree).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(profile.linktree).map(([platform, handle]) => {
              const handleStr = String(handle);
              const href =
                platform === 'twitter'
                  ? `https://twitter.com/${handleStr}`
                  : platform === 'github'
                    ? `https://github.com/${handleStr}`
                    : platform === 'website'
                      ? handleStr.startsWith('http')
                        ? handleStr
                        : `https://${handleStr}`
                      : '#';
              return (
                <a
                  key={platform}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 text-xs text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                >
                  {platform}
                  <ExternalLink className="h-3 w-3" />
                </a>
              );
            })}
          </div>
        )}

        {profile?.tags && Object.keys(profile.tags).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {Object.keys(profile.tags).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full bg-[#00EC97]/10 text-[#00EC97] text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4">
          {isOwnProfile && onEditProfile ? (
            <div className="flex gap-2">
              <ProfileEditDialog
                profile={profile}
                onSave={onEditProfile}
                isLoading={isEditLoading}
              />
            </div>
          ) : (
            !isOwnProfile &&
            (onFollow || onUnfollow) && (
              <>
                {isFollowing ? (
                  <button
                    onClick={onUnfollow}
                    className="px-4 py-2 rounded-lg border border-white/20 text-white/70 hover:bg-white/10 transition-colors text-sm cursor-pointer"
                  >
                    Unfollow
                  </button>
                ) : (
                  <button
                    onClick={onFollow}
                    className="px-4 py-2 rounded-lg bg-[#00EC97] text-black font-semibold hover:bg-[#00d084] transition-colors text-sm cursor-pointer"
                  >
                    Follow
                  </button>
                )}
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}
