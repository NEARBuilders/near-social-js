import type { ExecutionError } from '@near-js/types';
import { type Account, providers, transactions, utils } from 'near-api-js';

// credentials
import { account_id as socialContractAccountId } from '@test/credentials/localnet/social.test.near.json';

// controllers
import Social from './Social';

// helpers
import createEphemeralAccount from '@test/helpers/createEphemeralAccount';

// types
import type { IStorageBalanceOfResult } from '@app/types';

// utils
import convertNEARToYoctoNEAR from '@app/utils/convertNEARToYoctoNEAR';

describe(`${Social.name}#getVersion`, () => {
  let keyPair: utils.KeyPairEd25519;
  let signer: Account;

  beforeEach(async () => {
    const result = await createEphemeralAccount(convertNEARToYoctoNEAR('100'));

    keyPair = result.keyPair;
    signer = result.account;
  });

  it('should return null if the contract does not have a storage balance', async () => {
    // arrange
    const client = new Social({
      contractId: socialContractAccountId,
    });
    // act
    const result = await client.storageBalanceOf({
      accountId: signer.accountId,
      signer,
    });

    // assert
    expect(result).toBeNull();
  });

  it('should return the storage balance', async () => {
    // arrange
    const client = new Social({
      contractId: socialContractAccountId,
    });
    const deposit = convertNEARToYoctoNEAR('1');
    const transaction = await client.storageDeposit({
      publicKey: keyPair.publicKey,
      signer,
      accountId: signer.accountId,
      deposit,
    });
    let failure: ExecutionError | null;
    let result: IStorageBalanceOfResult | null;
    const [_, signedTransaction] = await transactions.signTransaction(
      transaction,
      signer.connection.signer,
      signer.accountId,
      signer.connection.networkId
    );
    const { status } =
      await signer.connection.provider.sendTransaction(signedTransaction);
    failure = (status as providers.FinalExecutionStatus)?.Failure || null;

    if (failure) {
      throw new Error(`${failure.error_type}: ${failure.error_message}`);
    }

    // act
    result = await client.storageBalanceOf({
      accountId: signer.accountId,
      signer,
    });

    // assert
    expect(result?.total).toEqual(deposit);
  });
});
