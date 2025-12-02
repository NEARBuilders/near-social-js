import { Account } from '@near-js/accounts';
import { KeyPairEd25519 } from '@near-js/crypto';
import { signTransaction, Transaction } from '@near-js/transactions';
import type { FinalExecutionStatus } from '@near-js/types';
// credentials
import { account_id as socialContractAccountId } from '@test/credentials/localnet/social.test.near.json';

// controllers
import Social from './Social';

// enums
import { NetworkIDEnum } from '@app/enums';

// helpers
import createEphemeralAccount from '@test/helpers/createEphemeralAccount';
import { randomBytes } from 'node:crypto';

// utils
import convertNEARToYoctoNEAR from '@app/utils/convertNEARToYoctoNEAR';

async function sendTransaction(
  transaction: Transaction,
  signer: Account
): Promise<void> {
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
    throw new Error(JSON.stringify(failure));
  }
}

describe(`${Social.name}#get`, () => {
  const client = new Social({
    contractId: socialContractAccountId,
    network: NetworkIDEnum.Localnet,
  });
  it('should return an empty object when the contract does not know the account', async () => {
    // act
    const result = await client.get({
      keys: ['unknown.test.near/profile/name'],
      useApiServer: false,
    });

    // assert
    expect(result).toEqual({});
  });

  it('should return the expected value for a key as set in the test.', async () => {
    let keyPair: KeyPairEd25519;
    let signer: Account;
    const result = await createEphemeralAccount(convertNEARToYoctoNEAR('100'));

    keyPair = result.keyPair;
    signer = result.account;

    let name = randomBytes(16).toString('hex');
    // arrange
    const data: Record<string, Record<string, unknown>> = {
      [signer.accountId]: {
        profile: {
          name: name,
        },
      },
    };
    let getResult: Record<string, unknown>;
    let transaction: Transaction;

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

    getResult = await client.get({
      keys: [`${signer.accountId}/profile/name`],
      useApiServer: false,
    });

    expect(getResult).toEqual(data);
  });

  it('should return the object from mainnet api server', async () => {
    //api server is only available for mainnet so we can't test this with the local test.
    //Hence for now, I have written a mainnet test.
    const client = new Social({
      contractId: socialContractAccountId,
      network: NetworkIDEnum.Mainnet,
    });
    // act
    const result = await client.get({
      keys: ['jass.near/profile/name/'],
    });

    expect(result).toEqual({
      'jass.near': {
        profile: {
          name: 'Jaswinder Singh',
        },
      },
    });
  });
});
