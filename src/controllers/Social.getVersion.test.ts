// constants
import { networkRPCs } from '@app/constants';

// credentials
import { account_id as socialContractAccountId } from '@test/credentials/localnet/social.test.near.json';

// controllers
import Social from './Social';

describe(`${Social.name}#getVersion`, () => {
  it('should return the version of the social contract', async () => {
    // arrange
    const client = new Social({
      contractId: socialContractAccountId,
      network: networkRPCs.localnet,
    });
    // act
    const version = await client.getVersion();

    // assert
    expect(version).toMatchSnapshot();
  });
});
