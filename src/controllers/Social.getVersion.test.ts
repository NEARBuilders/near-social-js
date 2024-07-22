import type { Account } from 'near-api-js';

// credentials
import { account_id as socialContractAccountId } from '@test/credentials/localnet/social.test.near.json';

// controllers
import Social from './Social';
import { networkRPCs } from '@app/constants';

// helpers
import createEphemeralAccount from '@test/helpers/createEphemeralAccount';

describe(`${Social.name}#getVersion`, () => {
  let signer: Account;

  beforeEach(async () => {
    const result = await createEphemeralAccount();

    signer = result.account;
  });

  it('should return the version of the social contract', async () => {
    // arrange
    const client = new Social({
      contractId: socialContractAccountId,
    });
    // act
    const version = await client.getVersion({
      rpcURL: networkRPCs.localnet,
    });

    // assert
    expect(version).toMatchSnapshot();
  });
});
