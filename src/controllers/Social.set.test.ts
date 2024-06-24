import { Account, providers, transactions, utils } from 'near-api-js';
import { randomBytes } from 'node:crypto';

// credentials
import { account_id as socialContractAccountId } from '@test/credentials/localnet/social.test.near.json';

// controllers
import Social from './Social';

// enums
import { ErrorCodeEnum } from '@app/enums';

// errors
import { KeyNotAllowedError } from '@app/errors';

// helpers
import accountAccessKey, {
  IAccessKeyResponse,
} from '@test/helpers/accountAccessKey';
import convertNEARToYoctoNEAR from '@app/utils/convertNEARToYoctoNEAR';
import createEphemeralAccount from '@test/helpers/createEphemeralAccount';

describe(`${Social.name}#set`, () => {
  let keyPair: utils.KeyPairEd25519;
  let signer: Account;
  let signerAccessKeyResponse: IAccessKeyResponse;
  let signerNonce: number;

  beforeEach(async () => {
    const result = await createEphemeralAccount(convertNEARToYoctoNEAR('100'));

    keyPair = result.keyPair;
    signer = result.account;
    signerAccessKeyResponse = await accountAccessKey(signer, keyPair.publicKey);
    signerNonce = signerAccessKeyResponse.nonce + 1;
  });

  it('should throw an error if the public key does not have write permission', async () => {
    // arrange
    const client = new Social({
      contractId: socialContractAccountId,
    });

    try {
      // act
      await client.set({
        blockHash: signerAccessKeyResponse.block_hash,
        data: {
          ['iamnotthesigner.test.near']: {
            profile: {
              name: randomBytes(16).toString('hex'),
            },
          },
        },
        nonce: BigInt(signerNonce + 1),
        publicKey: keyPair.publicKey,
        signer,
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
