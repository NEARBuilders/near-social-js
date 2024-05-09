import { Account, utils } from 'near-api-js';

// types
import type { IAccessKeyResponse } from './types';

/**
 * Convenience function to get an account's access key details.
 * @param {Account} account - the account.
 * @param {utils.PublicKey} publicKey - the public key of the account.
 * @returns {Promise<IAccessKeyResponse>} a promise that resolves to the account's access key.
 */
export default async function accountAccessKey(
  account: Account,
  publicKey: utils.PublicKey
): Promise<IAccessKeyResponse> {
  return await account.connection.provider.query<IAccessKeyResponse>(
    `access_key/${account.accountId}/${publicKey.toString()}`,
    ''
  );
}
