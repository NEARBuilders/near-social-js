import { Account, providers, transactions, utils } from 'near-api-js';
import { ViewMethodEnum } from '@app/enums';

// credentials
import { account_id as socialContractAccountId } from '@test/credentials/localnet/social.test.near.json';

// controllers
import Social from './Social';

// enums
import { NetworkIDEnum } from '@app/enums';

// helpers
import accountAccessKey, {
  IAccessKeyResponse,
} from '@test/helpers/accountAccessKey';
import convertNEARToYoctoNEAR from '@app/utils/convertNEARToYoctoNEAR';
import createEphemeralAccount from '@test/helpers/createEphemeralAccount';

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
      network: NetworkIDEnum.Localnet,
    });
    let resultBefore: Record<string, unknown>;
    let resultAfter: Record<string, unknown>;
    let transaction: transactions.Transaction;

    signerAccessKeyResponse = await accountAccessKey(signer, keyPair.publicKey);

    // act
    let accountId = signer.accountId;

    //Make deposit to the account
    //2N deposit
    let deposit = '2000000000000000000000000';
    transaction = await client.storageDeposit({
      blockHash: signerAccessKeyResponse.block_hash,
      nonce: BigInt(signerAccessKeyResponse.nonce + 1),
      accountId,
      deposit,
      signer: {
        accountID: signer.accountId,
        publicKey: keyPair.publicKey,
      },
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

    resultBefore = await signer.viewFunction({
      args: {
        account_id: signer.accountId,
      },
      contractId: socialContractAccountId,
      methodName: ViewMethodEnum.StorageBalanceOf,
    });

    // Test if the deposit was successful
    expect(resultBefore.total).toEqual(deposit);

    //1N withdraw
    let withdraw_amount = '1000000000000000000000000';
    transaction = await client.storageWithdraw({
      blockHash: signerAccessKeyResponse.block_hash,
      nonce: BigInt(signerAccessKeyResponse.nonce + 1 + 1),
      amount: withdraw_amount,
      signer: {
        accountID: signer.accountId,
        publicKey: keyPair.publicKey,
      },
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

    resultAfter = await signer.viewFunction({
      args: {
        account_id: signer.accountId,
      },
      contractId: socialContractAccountId,
      methodName: ViewMethodEnum.StorageBalanceOf,
    });

    // expect(BigInt(resultAfter?.total)).toEqual(
    //   BigInt(resultBefore?.total) - BigInt(withdraw_amount)
    // );
    expect(BigInt(resultAfter?.total as string)).toEqual(
      BigInt(resultBefore?.total as string) - BigInt(withdraw_amount)
    );
  });

  it('should withdraw all available storage given no amount is provided', async () => {
    // arrange
    const client = new Social({
      contractId: socialContractAccountId,
    });
    let resultBefore: Record<string, unknown>;
    let resultAfter: Record<string, unknown>;
    let transaction: transactions.Transaction;

    signerAccessKeyResponse = await accountAccessKey(signer, keyPair.publicKey);

    // act
    let accountId = signer.accountId;

    //Make deposit to the account
    //2N deposit
    let deposit = '2000000000000000000000000';
    transaction = await client.storageDeposit({
      blockHash: signerAccessKeyResponse.block_hash,
      nonce: BigInt(signerAccessKeyResponse.nonce + 1),
      accountId,
      deposit,
      signer: {
        accountID: signer.accountId,
        publicKey: keyPair.publicKey,
      },
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

    resultBefore = await signer.viewFunction({
      args: {
        account_id: signer.accountId,
      },
      contractId: socialContractAccountId,
      methodName: ViewMethodEnum.StorageBalanceOf,
    });

    // Test if the deposit was successful
    expect(resultBefore.total).toEqual(deposit);

    //No withdrawal amount specified
    transaction = await client.storageWithdraw({
      blockHash: signerAccessKeyResponse.block_hash,
      nonce: BigInt(signerAccessKeyResponse.nonce + 1 + 1),
      signer: {
        accountID: signer.accountId,
        publicKey: keyPair.publicKey,
      },
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

    resultAfter = await signer.viewFunction({
      args: {
        account_id: signer.accountId,
      },
      contractId: socialContractAccountId,
      methodName: ViewMethodEnum.StorageBalanceOf,
    });

    expect(resultAfter.available).toEqual('0');
  });
});
