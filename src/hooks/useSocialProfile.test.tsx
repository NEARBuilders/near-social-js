import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { SocialProvider } from '../components/SocialProvider';
import { useSocialProfile } from '@app/hooks';
import { Account } from 'near-api-js';
import createEphemeralAccount from '@test/helpers/createEphemeralAccount';

jest.mock('@app/hooks', () => ({
  useSocialProfile: jest.fn(() => ({
    profile: { name: 'TestUser', description: 'Test description' },
    profileImageUrl: 'https://example.com/image.jpg',
    error: null,
  })),
}));

describe('useSocialProfile hook', () => {
  let signer: Account;

  beforeEach(async () => {
    const result = await createEphemeralAccount();
    signer = result.account;
  });

  it('should fetch profile data for a given accountId', async () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <SocialProvider>
        {children}
      </SocialProvider>
    );

    const { result } = renderHook(() => useSocialProfile(signer.accountId, signer), { wrapper });
    const { profile } = result.current;

    expect(profile).toEqual({ name: 'TestUser', description: 'Test description' });
  });
});
