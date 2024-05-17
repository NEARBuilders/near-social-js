import { Account, providers, transactions, utils } from 'near-api-js';
import { randomBytes } from 'node:crypto';
import { NearAccount, Worker } from 'near-workspaces';
import { resolve } from 'node:path';
import { cwd } from 'node:process';

// constants
import { NETWORK_ID } from '@test/constants';

// controllers
import Social from './Social';

// helpers
import accountAccessKey, {
  IAccessKeyResponse,
} from '@test/helpers/accountAccessKey';
import createEphemeralAccount from '@test/helpers/createEphemeralAccount';

// utils
import convertNEARToYoctoNEAR from '@app/utils/convertNEARToYoctoNEAR';

describe(`${Social.name}#set`, () => {
  let contractAccount: NearAccount;
  let keyPair: utils.KeyPairEd25519;
  let signer: Account;
  let signerAccessKeyResponse: IAccessKeyResponse;
  let worker: Worker;

  beforeAll(async () => {
    worker = await Worker.init({
      network: NETWORK_ID,
    });

    contractAccount = await worker.rootAccount.devDeploy(
      resolve(cwd(), 'test', 'contracts', 'social_db.wasm')
    );
    await worker.rootAccount.call(contractAccount.accountId, 'new', {});
  });

  afterAll(async () => {
    await worker.tearDown();
  });

  beforeEach(async () => {
    const result = await createEphemeralAccount({
      initialBalanceInAtomicUnits: convertNEARToYoctoNEAR('100'),
      worker,
    });

    keyPair = result.keyPair;
    signer = result.account;
  });

  it('should set storage and add the data', async () => {
    // arrange
    const client = new Social({
      contractId: contractAccount.accountId,
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

    signerAccessKeyResponse = await accountAccessKey(signer, keyPair.publicKey);

    // act
    transaction = await client.set({
      blockHash: signerAccessKeyResponse.block_hash,
      data,
      nonce: BigInt(signerAccessKeyResponse.nonce + 1),
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
