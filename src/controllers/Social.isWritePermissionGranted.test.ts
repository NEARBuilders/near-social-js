import { Account, transactions, utils } from 'near-api-js';
import { randomBytes } from 'node:crypto';

// constants
import { networkRPCs } from '@app/constants';

// credentials
import { account_id as socialContractAccountId } from '@test/credentials/localnet/social.test.near.json';

// controllers
import Social from './Social';

// enums
import { ErrorCodeEnum } from '@app/enums';

// errors
import { InvalidAccountIdError } from '@app/errors';

// helpers
import accountAccessKey, {
  IAccessKeyResponse,
} from '@test/helpers/accountAccessKey';
import createEphemeralAccount from '@test/helpers/createEphemeralAccount';
import signAndSendTransaction from '@test/helpers/signAndSendTransaction';

// utils
import convertNEARToYoctoNEAR from '@app/utils/convertNEARToYoctoNEAR';

describe(`${Social.name}#isWritePermissionGranted`, () => {
  let client: Social;
  let granteeAccount: Account;
  let granteeKeyPair: utils.KeyPairEd25519;
  let granterAccount: Account;
  let granterKeyPair: utils.KeyPairEd25519;
  let granterKeyResponse: IAccessKeyResponse;
  let granterNonce: number;
  let key: string;

  beforeEach(async () => {
    const granteeAccountResult = await createEphemeralAccount(
      convertNEARToYoctoNEAR('100')
    );
    const granterAccountResult = await createEphemeralAccount(
      convertNEARToYoctoNEAR('100')
    );
    let transaction: transactions.Transaction;

    granteeAccount = granteeAccountResult.account;
    granteeKeyPair = granteeAccountResult.keyPair;
    granterAccount = granterAccountResult.account;
    granterKeyPair = granterAccountResult.keyPair;

    client = new Social({
      contractId: socialContractAccountId,
      network: networkRPCs.localnet,
    });
    key = `${granterAccount.accountId}/profile/name`;
    granterKeyResponse = await accountAccessKey(
      granterAccount,
      granterKeyPair.publicKey
    );
    granterNonce = granterKeyResponse.nonce + 1;

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
      signerAccountId: granterAccount.accountId,
      signerPublicKey: granterKeyPair.publicKey,
    });

    await signAndSendTransaction({
      signerAccount: granterAccount,
      transaction,
    });
  });

  it('should throw and error the the grantee is not a valid account id', async () => {
    // arrange
    const invalidGranteeAccountId = '*&s8_si(.test.near';

    // act
    try {
      await client.isWritePermissionGranted({
        granteeAccountId: invalidGranteeAccountId,
        key,
      });
    } catch (error) {
      // assert
      expect((error as InvalidAccountIdError).code).toBe(
        ErrorCodeEnum.InvalidAccountIdError
      );
      expect((error as InvalidAccountIdError).accountId).toBe(
        invalidGranteeAccountId
      );
    }
  });

  it('should return true if the grantee is the same as the key', async () => {
    // arrange
    // act
    const result = await client.isWritePermissionGranted({
      granteeAccountId: granterAccount.accountId,
      key,
    });

    // assert
    expect(result).toBe(true);
  });

  it('should return false if the grantee has not been granted write permission', async () => {
    // arrange
    // act
    const result = await client.isWritePermissionGranted({
      granteeAccountId: granteeAccount.accountId,
      key,
    });

    // assert
    expect(result).toBe(false);
  });

  it('should return true if the grantee has been given permission (using account id)', async () => {
    // arrange
    const transaction = await client.grantWritePermission({
      granteeAccountId: granteeAccount.accountId,
      keys: [key],
      signerAccountId: granterAccount.accountId,
      signerPublicKey: granterKeyPair.publicKey,
    });

    await signAndSendTransaction({
      signerAccount: granterAccount,
      transaction,
    });

    // act
    const result = await client.isWritePermissionGranted({
      granteeAccountId: granteeAccount.accountId,
      key,
    });

    // assert
    expect(result).toBe(true);
  });

  it('should return true if the grantee has been given permission (using public key)', async () => {
    // arrange
    const transaction = await client.grantWritePermission({
      granteePublicKey: granteeKeyPair.publicKey,
      keys: [key],
      signerAccountId: granterAccount.accountId,
      signerPublicKey: granterKeyPair.publicKey,
    });

    await signAndSendTransaction({
      signerAccount: granterAccount,
      transaction,
    });

    // act
    const result = await client.isWritePermissionGranted({
      granteePublicKey: granteeKeyPair.publicKey,
      key,
    });

    // assert
    expect(result).toBe(true);
  });
});
