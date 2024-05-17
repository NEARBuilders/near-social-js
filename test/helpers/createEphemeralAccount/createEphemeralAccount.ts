import { connect, keyStores, utils, Near } from 'near-api-js';
import { NearAccount, randomAccountId } from 'near-workspaces';

// constants
import { NETWORK_ID } from '@test/constants';

// types
import type { IOptions, IResult } from './types';

/**
 * Creates an ephemeral account with a randomised account ID.
 * @param {IOptions} options - the initial balance and the worker.
 * @returns {Promise<IResult>} a promise that resolves to the account and the account's access key pair.
 */
export default async function createEphemeralAccount({
  initialBalanceInAtomicUnits,
  worker,
}: IOptions): Promise<IResult> {
  const rootAccountKeyPair = await worker.rootAccount.getKey(); // get the faucet key pair
  const keyPair = utils.KeyPairEd25519.fromRandom(); // create the new access key to be used
  const keyStore = new keyStores.InMemoryKeyStore();
  let account: NearAccount;
  let near: Near;

  if (!rootAccountKeyPair) {
    throw new Error(
      `failed to get the root account "${worker.rootAccount.accountId}" access key`
    );
  }

  // create the new account with the initial balance
  account = await worker.rootAccount.createSubAccount(randomAccountId(), {
    initialBalance: initialBalanceInAtomicUnits,
    keyPair,
  });

  // set the keys to the in-memory keystore
  await keyStore.setKey(
    NETWORK_ID,
    worker.rootAccount.accountId,
    rootAccountKeyPair
  );
  await keyStore.setKey(NETWORK_ID, account.accountId, keyPair);

  near = await connect({
    networkId: NETWORK_ID,
    nodeUrl: worker.provider.connection.url,
    keyStore,
  });

  return {
    account: await near.account(account.accountId),
    keyPair,
  };
}
