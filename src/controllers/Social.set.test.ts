import { Account, providers, transactions, utils } from 'near-api-js';
import { randomBytes } from 'node:crypto';

// constants
import { MINIMUM_STORAGE_IN_BYTES } from '@app/constants';

// controllers
import Social from './Social';

// credentials
import { account_id as socialContractAccountId } from '@test/credentials/localnet/social.test.near.json';

// enums
import { ErrorCodeEnum, NetworkIDEnum } from '@app/enums';

// errors
import { KeyNotAllowedError } from '@app/errors';

// helpers
import accountAccessKey, {
  IAccessKeyResponse,
} from '@test/helpers/accountAccessKey';
import createEphemeralAccount from '@test/helpers/createEphemeralAccount';

// utils
import convertNEARToYoctoNEAR from '@app/utils/convertNEARToYoctoNEAR';

async function sendTransaction(
  transaction: transactions.Transaction,
  signer: Account
): Promise<void> {
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
    throw new Error(JSON.stringify(failure));
  }
}

describe(`${Social.name}#set`, () => {
  let client: Social;
  let keyPair: utils.KeyPairEd25519;
  let signer: Account;
  let signerAccessKeyResponse: IAccessKeyResponse;
  let signerNonce: number;

  beforeEach(async () => {
    const result = await createEphemeralAccount(convertNEARToYoctoNEAR('100'));

    client = new Social({
      contractId: socialContractAccountId,
      network: NetworkIDEnum.Localnet,
    });
    keyPair = result.keyPair;
    signer = result.account;
    signerAccessKeyResponse = await accountAccessKey(signer, keyPair.publicKey);
    signerNonce = signerAccessKeyResponse.nonce + 1;
  });

  it('should throw an error if the public key does not have write permission', async () => {
    // arrange
    try {
      // act
      await client.set({
        account: {
          accountID: signer.accountId,
          publicKey: keyPair.publicKey,
        },
        blockHash: signerAccessKeyResponse.block_hash,
        data: {
          ['iamnotthesigner.test.near']: {
            profile: {
              name: randomBytes(16).toString('hex'),
            },
          },
        },
        nonce: BigInt(signerNonce + 1),
      });
    } catch (error) {
      // assert
      expect((error as KeyNotAllowedError).code).toBe(
        ErrorCodeEnum.KeyNotAllowedError
      );

      return;
    }

    throw new Error(`should throw a key not allowed error`);
  });

  it('should add some arbitrary data', async () => {
    // arrange
    const data: Record<string, Record<string, unknown>> = {
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
      account: {
        accountID: signer.accountId,
        publicKey: keyPair.publicKey,
      },
      data,
    });

    // assert
    await sendTransaction(transaction, signer);

    result = await client.get({
      keys: [`${signer.accountId}/profile/name`],
      useApiServer: false,
    });

    expect(result).toEqual(data);
  });

  it('should add data that exceeds the minimum storage amount', async () => {
    // arrange
    const data: Record<string, Record<string, unknown>> = {
      [signer.accountId]: {
        profile: {
          name: randomBytes(parseInt(MINIMUM_STORAGE_IN_BYTES) + 1).toString(
            'hex'
          ),
        },
      },
    };
    let result: Record<string, unknown>;
    let transaction: transactions.Transaction;

    // act
    transaction = await client.set({
      account: {
        accountID: signer.accountId,
        publicKey: keyPair.publicKey,
      },
      data,
    });

    // assert
    await sendTransaction(transaction, signer);

    result = await client.get({
      keys: [`${signer.accountId}/profile/name`],
      useApiServer: false,
    });

    expect(result).toEqual(data);
  });
});
