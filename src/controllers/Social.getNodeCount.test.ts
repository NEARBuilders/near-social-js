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

describe('getNodeCount', () => {
  let client: Social;

  beforeAll(async () => {
    client = new Social({
      contractId: socialContractAccountId,
      network: NetworkIDEnum.Localnet,
    });
  });

  it('should return the correct node count after adding nodes', async () => {
    const initialCount = await client.getNodeCount();
    const numNodesToAdd = 3;

    for (let i = 0; i < numNodesToAdd; i++) {
      const { account: signer, keyPair } = await createEphemeralAccount(
        convertNEARToYoctoNEAR('100')
      );
      const data = {
        [signer.accountId]: {
          profile: {
            name: randomBytes(16).toString('hex'),
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

    const finalCount = await client.getNodeCount();
    expect(finalCount).toBe(initialCount + numNodesToAdd);
  });
});
