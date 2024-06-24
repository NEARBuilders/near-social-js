import { type Account, providers, transactions, utils } from 'near-api-js';

// credentials
import { account_id as socialContractAccountId } from '@test/credentials/localnet/social.test.near.json';

// controllers
import Social from './Social';

// helpers
import accountAccessKey, {
  type IAccessKeyResponse,
} from '@test/helpers/accountAccessKey';
import createEphemeralAccount from '@test/helpers/createEphemeralAccount';

// types
import type { IStorageBalanceOfResult } from '@app/types';

// utils
import convertNEARToYoctoNEAR from '@app/utils/convertNEARToYoctoNEAR';

describe(`${Social.name}#storageDeposit`, () => {
  let keyPair: utils.KeyPairEd25519;
  let signer: Account;
  let signerAccessKeyResponse: IAccessKeyResponse;

  beforeEach(async () => {
    const result = await createEphemeralAccount(convertNEARToYoctoNEAR('100'));

    keyPair = result.keyPair;
    signer = result.account;
  });

  it('should deposit storage for the signer account with account_id', async () => {
    // arrange
    const client = new Social({
      contractId: socialContractAccountId,
    });
    let result: IStorageBalanceOfResult | null;
    let transaction: transactions.Transaction;

    signerAccessKeyResponse = await accountAccessKey(signer, keyPair.publicKey);

    let accountId = signer.accountId;
    let deposit = '2000000000000000000000000';
    //testing optional blockhash and nonce too
    transaction = await client.storageDeposit({
      publicKey: keyPair.publicKey,
      signer,
      accountId,
      deposit,
    });

    // assert
    // the transaction's actions should have `storage_deposit`
    expect(transaction.actions).toHaveLength(1);

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

    result = await client.storageBalanceOf({
      accountId: signer.accountId,
      signer,
    });
    expect(result?.total).toEqual(deposit);
  });

  it('should deposit storage for the signer account without account_id', async () => {
    // arrange
    const client = new Social({
      contractId: socialContractAccountId,
    });
    let result: IStorageBalanceOfResult | null;
    let transaction: transactions.Transaction;

    signerAccessKeyResponse = await accountAccessKey(signer, keyPair.publicKey);

    // In the absence of account_id, the deposit is made to the signer
    let deposit = '2000000000000000000000000';
    transaction = await client.storageDeposit({
      blockHash: signerAccessKeyResponse.block_hash,
      nonce: BigInt(signerAccessKeyResponse.nonce + 1),
      publicKey: keyPair.publicKey,
      signer,
      deposit,
    });

    // assert
    // the transaction's actions should have `storage_deposit`
    expect(transaction.actions).toHaveLength(1);

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

    result = await client.storageBalanceOf({
      accountId: signer.accountId,
      signer,
    });
    expect(result?.total).toEqual(deposit);
  });

  it('should deposit storage for some third person account', async () => {
    // arrange
    const client = new Social({
      contractId: socialContractAccountId,
    });
    let result: IStorageBalanceOfResult | null;
    let transaction: transactions.Transaction;

    signerAccessKeyResponse = await accountAccessKey(signer, keyPair.publicKey);

    // act
    let accountId = String(Math.random()) + '.near';
    let deposit = '2000000000000000000000000';
    transaction = await client.storageDeposit({
      blockHash: signerAccessKeyResponse.block_hash,
      nonce: BigInt(signerAccessKeyResponse.nonce + 1),
      publicKey: keyPair.publicKey,
      signer,
      accountId,
      deposit,
    });

    // assert
    // the transaction's actions should have `storage_deposit`
    expect(transaction.actions).toHaveLength(1);

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

    result = await client.storageBalanceOf({
      accountId: signer.accountId,
      signer,
    });
    expect(result?.total).toEqual(deposit);
  });
});
