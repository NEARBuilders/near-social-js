import { Account, providers, transactions } from 'near-api-js';
import { account_id as socialContractAccountId } from '@test/credentials/localnet/social.test.near.json';
import Social from './Social';
import { NetworkIDEnum } from '@app/enums';
import createEphemeralAccount from '@test/helpers/createEphemeralAccount';
import { randomBytes } from 'node:crypto';
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

describe(`${Social.name}#getAccount`, () => {
  const client = new Social({
    contractId: socialContractAccountId,
    network: NetworkIDEnum.Localnet,
  });

  it('should return null when the account does not exist', async () => {
    // act
    const result = await client.getAccount({
      accountId: 'nonexistent.test.near',
    });

    // assert
    expect(result).toBeNull();
  });

  it('should return the account data when the account exists', async () => {
    // arrange
    const { account: signer, keyPair } = await createEphemeralAccount(
      convertNEARToYoctoNEAR('100')
    );
    const name = randomBytes(16).toString('hex');
    const data = {
      [signer.accountId]: {
        profile: {
          name: name,
        },
      },
    };

    // act
    const setTransaction = await client.set({
      account: {
        accountID: signer.accountId,
        publicKey: keyPair.publicKey,
      },
      data,
    });
    await sendTransaction(setTransaction, signer);

    const result = await client.getAccount({
      accountId: signer.accountId,
    });

    expect(result).toEqual(
      expect.objectContaining({
        permissions: [],
        shared_storage: null,
        storage_balance: '20000000000000000000000',
        used_bytes: 956,
      })
    );
    // Separately check that node_id exists and is a number
    expect(result).toHaveProperty('node_id');
    expect(typeof result.node_id).toBe('number');
  });
});
