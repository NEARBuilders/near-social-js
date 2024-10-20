import { Account } from '@near-js/accounts';
import { KeyPairEd25519 } from '@near-js/crypto';
import { signTransaction, Transaction } from '@near-js/transactions';
import type { FinalExecutionStatus } from '@near-js/types';

// controllers
import Social from './Social';

// credentials
import { account_id as socialContractAccountId } from '@test/credentials/localnet/social.test.near.json';

// enums
import { NetworkIDEnum, ViewMethodEnum } from '@app/enums';

// helpers
import convertNEARToYoctoNEAR from '@app/utils/convertNEARToYoctoNEAR';
import accountAccessKey, {
  IAccessKeyResponse,
} from '@test/helpers/accountAccessKey';
import createEphemeralAccount from '@test/helpers/createEphemeralAccount';

describe(`${Social.name}#storageDeposit`, () => {
  let keyPair: KeyPairEd25519;
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
      network: NetworkIDEnum.Localnet,
    });
    let result: Record<string, unknown>;
    let transaction: Transaction;

    signerAccessKeyResponse = await accountAccessKey(signer, keyPair.publicKey);

    let accountId = signer.accountId;
    let deposit = '2000000000000000000000000';
    //testing optional blockhash and nonce too
    transaction = await client.storageDeposit({
      accountId,
      deposit,
      account: {
        accountID: signer.accountId,
        publicKey: keyPair.publicKey,
      },
    });

    // assert
    // the transaction's actions should have `storage_deposit`
    expect(transaction.actions).toHaveLength(1);

    const [_, signedTransaction] = await signTransaction(
      transaction,
      signer.connection.signer,
      signer.accountId,
      signer.connection.networkId
    );
    const { status } =
      await signer.connection.provider.sendTransaction(signedTransaction);
    const failure = (status as FinalExecutionStatus)?.Failure || null;

    if (failure) {
      throw new Error(`${failure.error_type}: ${failure.error_message}`);
    }

    result = await signer.viewFunction({
      args: {
        account_id: signer.accountId,
      },
      contractId: socialContractAccountId,
      methodName: ViewMethodEnum.StorageBalanceOf,
    });
    expect(result.total).toEqual(deposit);
  });

  it('should deposit storage for the signer account without account_id', async () => {
    // arrange
    const client = new Social({
      contractId: socialContractAccountId,
    });
    let result: Record<string, unknown>;
    let transaction: Transaction;

    signerAccessKeyResponse = await accountAccessKey(signer, keyPair.publicKey);

    // In the absence of account_id, the deposit is made to the signer
    let deposit = '2000000000000000000000000';
    transaction = await client.storageDeposit({
      blockHash: signerAccessKeyResponse.block_hash,
      nonce: BigInt(signerAccessKeyResponse.nonce + 1),
      deposit,
      account: {
        accountID: signer.accountId,
        publicKey: keyPair.publicKey,
      },
    });

    // assert
    // the transaction's actions should have `storage_deposit`
    expect(transaction.actions).toHaveLength(1);

    const [_, signedTransaction] = await signTransaction(
      transaction,
      signer.connection.signer,
      signer.accountId,
      signer.connection.networkId
    );
    const { status } =
      await signer.connection.provider.sendTransaction(signedTransaction);
    const failure = (status as FinalExecutionStatus)?.Failure || null;

    if (failure) {
      throw new Error(`${failure.error_type}: ${failure.error_message}`);
    }

    result = await signer.viewFunction({
      args: {
        account_id: signer.accountId,
      },
      contractId: socialContractAccountId,
      methodName: ViewMethodEnum.StorageBalanceOf,
    });
    expect(result.total).toEqual(deposit);
  });

  it('should deposit storage for some third person account', async () => {
    // arrange
    const client = new Social({
      contractId: socialContractAccountId,
    });
    let result: Record<string, unknown>;
    let transaction: Transaction;

    signerAccessKeyResponse = await accountAccessKey(signer, keyPair.publicKey);

    // act
    let accountId = String(Math.random()) + '.near';
    let deposit = '2000000000000000000000000';
    transaction = await client.storageDeposit({
      blockHash: signerAccessKeyResponse.block_hash,
      nonce: BigInt(signerAccessKeyResponse.nonce + 1),
      accountId,
      deposit,
      account: {
        accountID: signer.accountId,
        publicKey: keyPair.publicKey,
      },
    });

    // assert
    // the transaction's actions should have `storage_deposit`
    expect(transaction.actions).toHaveLength(1);

    const [_, signedTransaction] = await signTransaction(
      transaction,
      signer.connection.signer,
      signer.accountId,
      signer.connection.networkId
    );
    const { status } =
      await signer.connection.provider.sendTransaction(signedTransaction);
    const failure = (status as FinalExecutionStatus)?.Failure || null;

    if (failure) {
      throw new Error(`${failure.error_type}: ${failure.error_message}`);
    }

    result = await signer.viewFunction({
      args: {
        account_id: accountId,
      },
      contractId: socialContractAccountId,
      methodName: ViewMethodEnum.StorageBalanceOf,
    });
    expect(result.total).toEqual(deposit);
  });
});
