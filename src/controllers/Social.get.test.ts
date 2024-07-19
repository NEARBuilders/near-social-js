import type { Account } from 'near-api-js';

// credentials
import { account_id as socialContractAccountId } from '@test/credentials/localnet/social.test.near.json';

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
      useApiServer: false,
    });

    // assert
    expect(result).toEqual({});
  });

  it('should return the object from mainnet api server', async () => {
    //This test could use some improvement. Maybe we create a test account on mainnet for this.
    //Or atleast information here that these tests are not meant for local tests.
    // arrange
    const client = new Social({
      contractId: socialContractAccountId,
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
