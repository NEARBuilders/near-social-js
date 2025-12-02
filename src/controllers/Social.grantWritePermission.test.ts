import { Account } from '@near-js/accounts';
import { KeyPairEd25519 } from '@near-js/crypto';
import { Transaction } from '@near-js/transactions';
import { randomBytes } from 'node:crypto';

// credentials
import { account_id as socialContractAccountId } from '@test/credentials/localnet/social.test.near.json';

// controllers
import Social from './Social';

// enums
import { ErrorCodeEnum, NetworkIDEnum } from '@app/enums';

// errors
import { InvalidAccountIdError, KeyNotAllowedError } from '@app/errors';

// helpers
import convertNEARToYoctoNEAR from '@app/utils/convertNEARToYoctoNEAR';
import accountAccessKey, {
  IAccessKeyResponse,
} from '@test/helpers/accountAccessKey';
import createEphemeralAccount from '@test/helpers/createEphemeralAccount';
import signAndSendTransaction from '@test/helpers/signAndSendTransaction';

describe(`${Social.name}#grantWritePermission`, () => {
  let client: Social;
  let granteeAccount: Account;
  let granteeKeyPair: KeyPairEd25519;
  let granterAccount: Account;
  let granterKeyPair: KeyPairEd25519;
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
    let transaction: Transaction;

    granteeAccount = granteeAccountResult.account;
    granteeKeyPair = granteeAccountResult.keyPair;
    granterAccount = granterAccountResult.account;
    granterKeyPair = granterAccountResult.keyPair;

    client = new Social({
      contractId: socialContractAccountId,
      network: NetworkIDEnum.Localnet,
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
      account: {
        accountID: granterAccount.accountId,
        publicKey: granterKeyPair.publicKey,
      },
    });

    await signAndSendTransaction({
      signerAccount: granterAccount,
      transaction,
    });
  });

  it('should throw an error if the grantee account is not a valid id', async () => {
    // arrange
    const invalidGranteeAccountId = '*&s8_si(.test.near';

    // act
    try {
      await client.grantWritePermission({
        account: {
          accountID: granterAccount.accountId,
          publicKey: granterKeyPair.publicKey,
        },
        blockHash: granterKeyResponse.block_hash,
        granteeAccountId: invalidGranteeAccountId,
        keys: [key],
        nonce: BigInt(granterNonce + 1),
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

  it(`should throw an error if the a key's account id is invalid`, async () => {
    // arrange
    const invalidKeyAccountId = '*&s8_si(.test.near';

    // act
    try {
      await client.grantWritePermission({
        account: {
          accountID: granterAccount.accountId,
          publicKey: granterKeyPair.publicKey,
        },
        blockHash: granterKeyResponse.block_hash,
        granteeAccountId: granteeAccount.accountId,
        keys: [`${invalidKeyAccountId}/profile/name`],
        nonce: BigInt(granterNonce + 1),
      });
    } catch (error) {
      // assert
      expect((error as InvalidAccountIdError).code).toBe(
        ErrorCodeEnum.InvalidAccountIdError
      );
      expect((error as InvalidAccountIdError).accountId).toBe(
        invalidKeyAccountId
      );
    }
  });

  it(`should throw an error if the a key's account id does not belong the signer (granter)`, async () => {
    // arrange
    key = 'iamnotthegranter.test.near/profile/name';

    // act
    try {
      await client.grantWritePermission({
        account: {
          accountID: granterAccount.accountId,
          publicKey: granterKeyPair.publicKey,
        },
        blockHash: granterKeyResponse.block_hash,
        granteeAccountId: granteeAccount.accountId,
        keys: [key],
        nonce: BigInt(granterNonce + 1),
      });
    } catch (error) {
      // assert
      expect((error as KeyNotAllowedError).code).toBe(
        ErrorCodeEnum.KeyNotAllowedError
      );
      expect((error as KeyNotAllowedError).key).toBe(key);
    }
  });

  it('should set the write permission for a given account id', async () => {
    // arrange
    let result: boolean;
    let transaction: Transaction;

    // act
    transaction = await client.grantWritePermission({
      account: {
        accountID: granterAccount.accountId,
        publicKey: granterKeyPair.publicKey,
      },
      blockHash: granterKeyResponse.block_hash,
      granteeAccountId: granteeAccount.accountId,
      keys: [key],
      nonce: BigInt(granterNonce + 1),
    });

    await signAndSendTransaction({
      signerAccount: granterAccount,
      transaction,
    });

    // assert
    result = await client.isWritePermissionGranted({
      granteeAccountId: granteeAccount.accountId,
      key,
    });

    expect(result).toBe(true);
  });

  it('should set the write permission for a given public key', async () => {
    // arrange
    let result: boolean;
    let transaction: Transaction;

    // act
    transaction = await client.grantWritePermission({
      account: {
        accountID: granterAccount.accountId,
        publicKey: granterKeyPair.publicKey,
      },
      blockHash: granterKeyResponse.block_hash,
      granteePublicKey: granteeKeyPair.publicKey,
      keys: [key],
      nonce: BigInt(granterNonce + 1),
    });

    await signAndSendTransaction({
      signerAccount: granterAccount,
      transaction,
    });

    // assert
    result = await client.isWritePermissionGranted({
      granteePublicKey: granteeKeyPair.publicKey,
      key,
    });

    expect(result).toBe(true);
  });
});
