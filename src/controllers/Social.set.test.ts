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
import convertNEARToYoctoNEAR from '@test/helpers/convertNEARToYoctoNEAR';

describe(`${Social.name}#set`, () => {
  let signer: Account;
  let signerAccessKey: IAccessKeyResponse;
  let signerPublicKey: utils.PublicKey;
  let connection: Near;

  beforeAll(async () => {
    let faucetAccount: Account;

    connection = await createNearConnection({
      credentialsDir: resolve(cwd(), 'test', 'credentials'),
    });
    faucetAccount = await connection.account(GENESIS_ACCOUNT_ID);
    signer = await connection.account(CAPTAIN_KIRK_ACCOUNT_ID);
    signerPublicKey = await signer.connection.signer.getPublicKey(
      signer.accountId,
      signer.connection.networkId
    );

    // fund the signer account
    await faucetAccount.sendMoney(
      signer.accountId,
      convertNEARToYoctoNEAR(BigInt('10'))
    );
  });

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
      signer.connection.networkId
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
