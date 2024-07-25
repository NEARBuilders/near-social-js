import type { AccessKeyInfoView } from '@near-js/types';

// types
import type { IOptions, IResponse } from './types';

/**
 * Convenience function to get an account's access keys details.
 * @param {IOptions} options - the account ID and a provider to direct to which RPC to query.
 * @returns {Promise<AccessKeyInfoView[]>} a promise that resolves to the account's access keys details.
 */
export default async function viewAccessKeyList({
  accountID,
  provider,
}: IOptions): Promise<AccessKeyInfoView[]> {
  const response = await provider.query<IResponse>({
    account_id: accountID,
    finality: 'optimistic',
    request_type: 'view_access_key_list',
  });

  // convert the nonces into bigint
  return response.keys.map(({ access_key, public_key }) => ({
    public_key,
    access_key: {
      ...access_key,
      nonce: BigInt(access_key.nonce),
    },
  }));
}
