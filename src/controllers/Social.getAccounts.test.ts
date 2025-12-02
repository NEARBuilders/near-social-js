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

describe(`${Social.name}#getAccounts`, () => {
  const client = new Social({
    contractId: socialContractAccountId,
    network: NetworkIDEnum.Localnet,
  });

  it('should return accounts with pagination', async () => {
    // arrange
    await Promise.all(
      Array(3)
        .fill(null)
        .map(async () => {
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
          const setTransaction = await client.set({
            account: {
              accountID: signer.accountId,
              publicKey: keyPair.publicKey,
            },
            data,
          });
          await sendTransaction(setTransaction, signer);
          return { accountId: signer.accountId, name };
        })
    );

    // act
    const result1 = await client.getAccounts({ limit: 2 });
    //console.log(result1);
    const result2 = await client.getAccounts({ fromIndex: 2, limit: 1 });

    // assert
    expect(Object.keys(result1)).toHaveLength(2);
    expect(Object.keys(result2)).toHaveLength(1);
    //@to-do better asserts
  });
});
