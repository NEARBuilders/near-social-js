import { Account, providers, transactions, utils } from 'near-api-js';
import { randomBytes } from 'node:crypto';

// credentials
import { account_id as socialContractAccountId } from '@test/credentials/localnet/social.test.near.json';

// controllers
import Social from './Social';

// helpers
import accountAccessKey from '@test/helpers/accountAccessKey';
import convertNEARToYoctoNEAR from '@app/utils/convertNEARToYoctoNEAR';
import createEphemeralAccount from '@test/helpers/createEphemeralAccount';
import signAndSendTransaction from '@test/helpers/signAndSendTransaction';

describe(`${Social.name}#grantWritePermission`, () => {
  let granteeAccount: Account;
  let granteeKeyPair: utils.KeyPairEd25519;
  let granterAccount: Account;
  let granterKeyPair: utils.KeyPairEd25519;

  beforeEach(async () => {
    const granteeAccountResult = await createEphemeralAccount(
      convertNEARToYoctoNEAR('100')
    );
    const granterAccountResult = await createEphemeralAccount(
      convertNEARToYoctoNEAR('100')
    );

    granteeAccount = granteeAccountResult.account;
    granteeKeyPair = granteeAccountResult.keyPair;
    granterAccount = granterAccountResult.account;
    granterKeyPair = granterAccountResult.keyPair;
  });

  it('should set the write permission for a given account', async () => {
    // arrange
    const client = new Social({
      contractId: socialContractAccountId,
    });
    const granterKeyResponse = await accountAccessKey(
      granterAccount,
      granterKeyPair.publicKey
    );
    const key = `${granterAccount.accountId}/profile/name`;
    let result: boolean;
    let transaction: transactions.Transaction;
    let granterNonce: number = granterKeyResponse.nonce + 1;

    // set the granter
    transaction = await client.set({
      blockHash: granterKeyResponse.block_hash,
      data: {
        [granterAccount.accountId]: {
          profile: {
            name: randomBytes(16).toString('hex'),
          },
        },
      },
      nonce: BigInt(granterNonce),
      publicKey: granterKeyPair.publicKey,
      signer: granterAccount,
    });

    await signAndSendTransaction({
      signerAccount: granterAccount,
      transaction,
    });

    granterNonce = granterNonce + 1;

    // act
    transaction = await client.grantWritePermission({
      blockHash: granterKeyResponse.block_hash,
      granteeAccountId: granteeAccount.accountId,
      keys: [key],
      nonce: BigInt(granterNonce),
      publicKey: granterKeyPair.publicKey,
      signer: granterAccount,
    });

    const test = await signAndSendTransaction({
      signerAccount: granterAccount,
      transaction,
    });

    // assert
    result = await client.isWritePermissionGranted({
      granteeAccountId: granteeAccount.accountId,
      key,
      signer: granteeAccount,
    });

    expect(result).toBe(true);
  });
});
