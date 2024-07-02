import BigNumber from 'bignumber.js';
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

describe(`${Social.name}#storageWithdraw`, () => {
  let keyPair: utils.KeyPairEd25519;
  let signer: Account;
  let signerAccessKeyResponse: IAccessKeyResponse;

  beforeEach(async () => {
    const result = await createEphemeralAccount(convertNEARToYoctoNEAR('100'));

    keyPair = result.keyPair;
    signer = result.account;
  });

  it('should withdraw storage given an amount', async () => {
    // arrange
    const client = new Social({
      contractId: socialContractAccountId,
    });
    let resultBefore: IStorageBalanceOfResult | null;
    let resultAfter: IStorageBalanceOfResult | null;
    let transaction: transactions.Transaction;

    signerAccessKeyResponse = await accountAccessKey(signer, keyPair.publicKey);

    // act
    let accountId = signer.accountId;

    //Make deposit to the account
    //2N deposit
    let deposit = convertNEARToYoctoNEAR('2');
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

    let [_, signedTransaction] = await transactions.signTransaction(
      transaction,
      signer.connection.signer,
      signer.accountId,
      signer.connection.networkId
    );
    let { status } =
      await signer.connection.provider.sendTransaction(signedTransaction);
    let failure = (status as providers.FinalExecutionStatus)?.Failure || null;

    if (failure) {
      throw new Error(`${failure.error_type}: ${failure.error_message}`);
    }

    resultBefore = await client.storageBalanceOf({
      accountId: signer.accountId,
      signer,
    });

    // Test if the deposit was successful
    expect(resultBefore?.total).toEqual(deposit);

    //1N withdraw
    let withdraw_amount = convertNEARToYoctoNEAR('1');
    transaction = await client.storageWithdraw({
      blockHash: signerAccessKeyResponse.block_hash,
      nonce: BigInt(signerAccessKeyResponse.nonce + 1 + 1),
      publicKey: keyPair.publicKey,
      signer,
      amount: withdraw_amount,
    });

    // assert
    // the transaction's actions should have `storage_withdraw`
    expect(transaction.actions).toHaveLength(1);

    [_, signedTransaction] = await transactions.signTransaction(
      transaction,
      signer.connection.signer,
      signer.accountId,
      signer.connection.networkId
    );
    let status1 =
      await signer.connection.provider.sendTransaction(signedTransaction);
    failure =
      (status1.status as providers.FinalExecutionStatus)?.Failure || null;

    if (failure) {
      throw new Error(`${failure.error_type}: ${failure.error_message}`);
    }

    resultAfter = await client.storageBalanceOf({
      accountId: signer.accountId,
      signer,
    });

    // expect(BigInt(resultAfter?.total)).toEqual(
    //   BigInt(resultBefore?.total) - BigInt(withdraw_amount)
    // );
    expect(resultAfter?.total).toBe(
      new BigNumber(resultBefore?.total || '0')
        .minus(new BigNumber(withdraw_amount))
        .toFixed()
    );
  });

  it('should withdraw all available storage given no amount is provided', async () => {
    // arrange
    const client = new Social({
      contractId: socialContractAccountId,
    });
    let resultBefore: IStorageBalanceOfResult | null;
    let resultAfter: IStorageBalanceOfResult | null;
    let transaction: transactions.Transaction;

    signerAccessKeyResponse = await accountAccessKey(signer, keyPair.publicKey);

    // act
    let accountId = signer.accountId;

    //Make deposit to the account
    //2N deposit
    let deposit = convertNEARToYoctoNEAR('2');
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

    let [_, signedTransaction] = await transactions.signTransaction(
      transaction,
      signer.connection.signer,
      signer.accountId,
      signer.connection.networkId
    );
    let { status } =
      await signer.connection.provider.sendTransaction(signedTransaction);
    let failure = (status as providers.FinalExecutionStatus)?.Failure || null;

    if (failure) {
      throw new Error(`${failure.error_type}: ${failure.error_message}`);
    }

    resultBefore = await client.storageBalanceOf({
      accountId: signer.accountId,
      signer,
    });

    // Test if the deposit was successful
    expect(resultBefore?.total).toEqual(deposit);

    //No withdrawal amount specified
    transaction = await client.storageWithdraw({
      blockHash: signerAccessKeyResponse.block_hash,
      nonce: BigInt(signerAccessKeyResponse.nonce + 1 + 1),
      publicKey: keyPair.publicKey,
      signer,
    });

    // assert
    // the transaction's actions should have `storage_withdraw`
    expect(transaction.actions).toHaveLength(1);

    [_, signedTransaction] = await transactions.signTransaction(
      transaction,
      signer.connection.signer,
      signer.accountId,
      signer.connection.networkId
    );
    let status1 =
      await signer.connection.provider.sendTransaction(signedTransaction);
    failure =
      (status1.status as providers.FinalExecutionStatus)?.Failure || null;

    if (failure) {
      throw new Error(`${failure.error_type}: ${failure.error_message}`);
    }

    resultAfter = await client.storageBalanceOf({
      accountId: signer.accountId,
      signer,
    });

    expect(resultAfter?.available).toBe('0');
  });
});
