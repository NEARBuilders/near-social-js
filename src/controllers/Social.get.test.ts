import type { Account } from 'near-api-js';

// credentials
import { account_id as socialContractAccountId } from '@test/credentials/localnet/social.test.near.json';

// controllers
import Social from './Social';
import { networkRPCs } from '@app/constants';

describe(`${Social.name}#get`, () => {
  it('should return an empty object when the contract does not know the account', async () => {
    // arrange
    const client = new Social({
      contractId: socialContractAccountId,
    });
    // act
    const result = await client.get({
      keys: ['unknown.test.near/profile/name'],
      rpcURL: networkRPCs.localnet,
    });

    // assert
    expect(result).toEqual({});
  });
});
