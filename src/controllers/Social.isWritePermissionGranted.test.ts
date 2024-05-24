import { Account, providers, transactions, utils } from 'near-api-js';
import { randomBytes } from 'node:crypto';

// credentials
import { account_id as socialContractAccountId } from '@test/credentials/localnet/social.test.near.json';

// controllers
import Social from './Social';

// helpers
import accountAccessKey from '@test/helpers/accountAccessKey';
import createEphemeralAccount from '@test/helpers/createEphemeralAccount';

// utils
import convertNEARToYoctoNEAR from '@app/utils/convertNEARToYoctoNEAR';

describe(`${Social.name}#isWritePermissionGranted`, () => {
  let keyPair: utils.KeyPairEd25519;
  let signer: Account;

  beforeEach(async () => {
    const result = await createEphemeralAccount(convertNEARToYoctoNEAR('100'));

    keyPair = result.keyPair;
    signer = result.account;
  });

  it('should return true if the write', async () => {
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
    const signerAccessKeyResponse = await accountAccessKey(
      signer,
      keyPair.publicKey
    );
    const transaction = await client.set({
      blockHash: signerAccessKeyResponse.block_hash,
      data,
      nonce: BigInt(signerAccessKeyResponse.nonce + 1),
      publicKey: keyPair.publicKey,
      signer,
    });
    let result: boolean;

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

    // act
    result = await client.isWritePermissionGranted({
      key: `${signer.accountId}/profile/name`,
      signer,
    });

    // assert
    expect(result).toBe(true);
  });
});
