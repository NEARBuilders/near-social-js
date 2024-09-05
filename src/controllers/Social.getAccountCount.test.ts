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

//to-do - Need fix for parallel runs
describe(`${Social.name}#getAccountCount`, () => {
  const client = new Social({
    contractId: socialContractAccountId,
    network: NetworkIDEnum.Localnet,
  });

  it('should return the correct account count after adding accounts', async () => {
    // arrange
    const initialCount = await client.getAccountCount();
    const numAccountsToAdd = 2;

    // act
    for (let i = 0; i < numAccountsToAdd; i++) {
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
    }

    const finalCount = await client.getAccountCount();

    // assert
    expect(finalCount).toBe(initialCount + numAccountsToAdd);
  });
});
