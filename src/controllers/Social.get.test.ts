import type { Account } from 'near-api-js';

// credentials
import { account_id as socialContractAccountId } from '@test/credentials/localnet/test.near.json';

// controllers
import Social from './Social';

// helpers
import createEphemeralAccount from '@test/helpers/createEphemeralAccount';

describe(`${Social.name}#get`, () => {
  let signer: Account;

  beforeEach(async () => {
    const result = await createEphemeralAccount();

    signer = result.account;
  });

  it('should return an empty object when the contract does not know the account', async () => {
    // arrange
    const client = new Social({
      contractId: socialContractAccountId,
    });
    // act
    const result = await client.get({
      keys: ['unknown.test.near/profile/name'],
      signer,
    });

    // assert
    expect(result).toEqual({});
  });
});
