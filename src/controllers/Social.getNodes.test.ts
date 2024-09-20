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

describe('getNodes', () => {
  let client: Social;

  beforeAll(async () => {
    client = new Social({
      contractId: socialContractAccountId,
      network: NetworkIDEnum.Localnet,
    });
  });

  it('should return nodes with pagination', async () => {
    // Create multiple nodes
    for (let i = 0; i < 3; i++) {
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

    const result1 = await client.getNodes({ limit: 2 });
    const result2 = await client.getNodes({ fromIndex: 2, limit: 2 });

    expect(Object.keys(result1).length).toBe(2);
    expect(Object.keys(result2).length).toBeGreaterThan(0);
  });
});
