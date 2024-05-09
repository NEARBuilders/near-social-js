import { Account, Near, transactions, utils } from 'near-api-js';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import { cwd } from 'node:process';

// constants
import {
  CAPTAIN_KIRK_ACCOUNT_ID,
  GENESIS_ACCOUNT_ID,
  SOCIAL_CONTRACT_ACCOUNT_ID,
} from '@test/constants';

// controllers
import Social from './Social';

// helpers
import accountAccessKey, {
  IAccessKeyResponse,
} from '@test/helpers/accountAccessKey';
import createNearConnection from '@test/helpers/createNearConnection';

describe(Social.name, () => {
  let signer: Account;
  let signerAccessKey: IAccessKeyResponse;
  let signerPublicKey: utils.PublicKey;
  let near: Near;

  beforeAll(async () => {
    near = await createNearConnection({
      credentialsDir: resolve(cwd(), 'test', 'credentials'),
    });
    signer = await near.account(GENESIS_ACCOUNT_ID);
    signerPublicKey = await signer.connection.signer.getPublicKey(
      signer.accountId,
      signer.connection.networkId
    );
  });

  describe('get', () => {
    it('should return an empty object when the contract does not know the account', async () => {
      // arrange
      const client = new Social({
        contractId: SOCIAL_CONTRACT_ACCOUNT_ID,
      });
      // act
      const result = await client.get({
        keys: ['unknown.test.near/profile/name'],
        signer,
      });

      // assert
      expect(result).toEqual({});
    });
  });

  describe('getVersion', () => {
    it('should return the version of the social contract', async () => {
      // arrange
      const client = new Social({
        contractId: SOCIAL_CONTRACT_ACCOUNT_ID,
      });
      // act
      const version = await client.getVersion({ signer });

      // assert
      expect(version).toMatchSnapshot();
    });
  });

  describe('set', () => {
    it('should set the name for an account', async () => {
      // arrange
      const client = new Social({
        contractId: SOCIAL_CONTRACT_ACCOUNT_ID,
      });
      const name = randomBytes(32).toString('hex');
      let result: Record<string, unknown>;
      let transaction: transactions.Transaction;

      signerAccessKey = await accountAccessKey(signer, signerPublicKey);

      // act
      transaction = await client.set({
        blockHash: signerAccessKey.block_hash,
        data: {
          [CAPTAIN_KIRK_ACCOUNT_ID]: {
            profile: {
              name,
            },
          },
        },
        nonce: BigInt(signerAccessKey.nonce + 1),
        publicKey: signerPublicKey,
        signer,
      });
      const [_, signedTransaction] = await transactions.signTransaction(
        transaction,
        signer.connection.signer,
        signer.accountId,
        near.connection.networkId
      );
      await signer.connection.provider.sendTransaction(signedTransaction);

      // assert
      result = await client.get({
        keys: [`${CAPTAIN_KIRK_ACCOUNT_ID}/profile/name`],
        signer,
      });

      expect(result).toEqual({});
    });
  });
});
