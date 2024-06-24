import { useEffect, useState } from 'react';
import { useSocial } from './useSocial';
import { SOCIAL_IPFS_BASE_URL } from '../constants';
import { ISocialProfile } from '@app/types';
import { Account } from 'near-api-js';

export const useSocialProfile = (
  accountId: string | null | undefined,
  signer: Account
) => {
  const { social } = useSocial();
  const [profile, setProfile] = useState<ISocialProfile | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const profileImageUrl =
    profile?.image?.url ?? profile?.image?.ipfs_cid
      ? `${SOCIAL_IPFS_BASE_URL}/${profile?.image?.ipfs_cid}`
      : undefined;

  useEffect(() => {
    if (!accountId || !social) return;

    const fetchProfile = async () => {
      try {
        const response = await social.get({
          signer,
          keys: [`${accountId}/profile/**`],
        });

        setProfile(
          (response[accountId] as { profile?: ISocialProfile })?.profile ?? {}
        );
      } catch (error) {
        console.error(error);
        setError('Failed to fetch profile data');
      }
    };

    fetchProfile();
  }, [accountId, social, signer]);

  return {
    profile,
    profileImageUrl,
    error,
  };
};
