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

describe('getNode', () => {
  let client: Social;
  let testNodeId: number;

  beforeAll(async () => {
    client = new Social({
      contractId: socialContractAccountId,
      network: NetworkIDEnum.Localnet,
    });
  });

  beforeEach(async () => {
    // Create a test node before each test
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

    // Assume the first node created has ID 1. Adjust if your implementation differs.
    testNodeId = 1;
  });

  it('should return null when the node does not exist', async () => {
    const result = await client.getNode({ nodeId: 999999 });
    expect(result).toBeNull();
  });

  it('should return the node data when the node exists', async () => {
    const result = await client.getNode({ nodeId: testNodeId });
    const resultString = JSON.stringify(result);
    expect(resultString).toContain(`"node_id":${testNodeId}`);
  });

  it('should handle pagination parameters', async () => {
    const result = await client.getNode({
      nodeId: testNodeId,
      fromIndex: 0,
      limit: 10,
    });
    expect(result).toBeDefined();
    // Add more specific assertions
  });
});
