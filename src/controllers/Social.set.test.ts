import { Account, providers, transactions, utils } from 'near-api-js';
import { randomBytes } from 'node:crypto';

// credentials
import { account_id as socialContractAccountId } from '@test/credentials/localnet/social.test.near.json';

// controllers
import Social from './Social';

// helpers
import convertNEARToYoctoNEAR from '@app/utils/convertNEARToYoctoNEAR';
import createEphemeralAccount from '@test/helpers/createEphemeralAccount';

describe(`${Social.name}#set`, () => {
  let keyPair: utils.KeyPairEd25519;
  let signer: Account;

  beforeEach(async () => {
    const result = await createEphemeralAccount(convertNEARToYoctoNEAR('100'));

    keyPair = result.keyPair;
    signer = result.account;
  });

  it('should set storage and add the data', async () => {
    // arrange
    const client = new Social({
      contractId: socialContractAccountId,
    });
    const data = {
      [signer.accountId]: {
        profile: {
          name: randomBytes(16).toString('hex'),
        },
      },
    };
    let result: Record<string, unknown>;
    let transaction: transactions.Transaction;

    // act
    transaction = await client.set({
      data,
      publicKey: keyPair.publicKey,
      signer,
    });

    // assert
    // the transaction's actions should have `storage_deposit` and the `set` function calls
    expect(transaction.actions).toHaveLength(2);

    const [_, signedTransaction] = await transactions.signTransaction(
      transaction,
      signer.connection.signer,
      signer.accountId,
      signer.connection.networkId
    );
    const { status } =
      await signer.connection.provider.sendTransaction(signedTransaction);
    const failure = (status as providers.FinalExecutionStatus)?.Failure || null;

    if (failure) {
      throw new Error(`${failure.error_type}: ${failure.error_message}`);
    }

    result = await client.get({
      keys: [`${signer.accountId}/profile/name`],
      signer,
    });

    expect(result).toEqual(data);
  });
});
