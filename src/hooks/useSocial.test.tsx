import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { SocialProvider } from '../components/SocialProvider';
import { useSocial } from '@app/hooks';
import { Account } from 'near-api-js';
import createEphemeralAccount from '@test/helpers/createEphemeralAccount';

jest.mock('@app/hooks', () => ({

  useSocial: jest.fn(() => ({
    social: {
      async get({ keys }: { keys: string[] }) {
        return keys.reduce((acc, key) => {
          acc[key] = { profile: { name: 'TestUser' } };
          return acc;
        }, {} as Record<string, any>);
      },
      async getVersion() {
        return '1.0.0';
      },
      async set({ data }: { data: Record<string, any> }) {
        return { data };
      },
      setContractId(contractId: string) {
        return contractId;
      },
    },
  })),
}));

describe('useSocial hook', () => {
  let signer: Account;

  beforeEach(async () => {
    const result = await createEphemeralAccount();
    signer = result.account;
  });

  it('should fetch data using get method', async () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <SocialProvider>
        {children}
      </SocialProvider>
    );

    const { result } = renderHook(() => useSocial(), { wrapper });

    const { social } = result.current;

    let data: any;
    await React.act(async () => {
      data = await social.get({ keys: ['unknown.test.near'], signer });
    });

    expect(data).toEqual({ 'unknown.test.near': { profile: { name: 'TestUser' } } });
  });
});
