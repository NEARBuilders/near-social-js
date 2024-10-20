import { connect, Near } from 'near-api-js';
import { Account } from '@near-js/accounts';
import { KeyPair, KeyPairEd25519 } from '@near-js/crypto';
import { randomBytes } from 'node:crypto';
import { InMemoryKeyStore } from '@near-js/keystores';

// constants
import { NETWORK_ID, NODE_URL } from '@test/constants';

// credentials
import {
  account_id as faucetAccountId,
  secret_key as faucetSecretKey,
} from '@test/credentials/localnet/test.near.json';

// types
import type { IResult } from './types';
import { KeyPairString } from '@near-js/crypto';

/**
 * Creates an ephemeral account with a randomised account ID of 8 lower case hexadecimal characters.
 * @param {string} initialBalanceInAtomicUnits - [optional] the initial balance of the account in account units.
 * Defaults to zero.
 * @returns {Promise<IResult>} a promise that resolves to the account and the account's access key pair.
 */
export default async function createEphemeralAccount(
  initialBalanceInAtomicUnits?: string
): Promise<IResult> {
  const accountId = `${randomBytes(8).toString('hex').toLowerCase()}.test.near`;
  const faucetKeyPair = KeyPair.fromString(faucetSecretKey as KeyPairString); // get the faucet key pair
  const keyPair = KeyPairEd25519.fromRandom(); // create the new access key to be used
  const keyStore = new InMemoryKeyStore();
  let faucetAccount: Account;
  let near: Near;

  // set the keys to the in-memory keystore
  await keyStore.setKey(NETWORK_ID, faucetAccountId, faucetKeyPair);
  await keyStore.setKey(NETWORK_ID, accountId, keyPair);

  near = await connect({
    networkId: NETWORK_ID,
    nodeUrl: NODE_URL,
    keyStore,
  });
  faucetAccount = await near.account(faucetAccountId);

  // create the new account with the initial balance
  await faucetAccount.createAccount(
    accountId,
    keyPair.publicKey,
    initialBalanceInAtomicUnits
      ? BigInt(initialBalanceInAtomicUnits)
      : BigInt('0')
  );

  return {
    account: await near.account(accountId),
    keyPair,
  };
}
