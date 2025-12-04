import type { Profile } from 'near-social-js';

interface ProfileAvatarProps {
  accountId: string;
  profile?: Profile | null;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-lg',
};

export function ProfileAvatar({
  accountId,
  profile,
  size = 'md',
  showName = true,
}: ProfileAvatarProps) {
  const imageUrl = profile?.image?.ipfs_cid
    ? `https://ipfs.near.social/ipfs/${profile.image.ipfs_cid}`
    : profile?.image?.url;

  const initials = (profile?.name || accountId).slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-[#00EC97]/30 to-[#3D7FFF]/30 flex items-center justify-center overflow-hidden border border-white/20`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={profile?.name || accountId}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-semibold text-white/70">{initials}</span>
        )}
      </div>
      {showName && (
        <div className="flex flex-col">
          {profile?.name && (
            <span className="text-white font-medium text-sm">
              {profile.name}
            </span>
          )}
          <span className="text-white/50 text-xs font-mono">{accountId}</span>
        </div>
      )}
    </div>
  );
}
