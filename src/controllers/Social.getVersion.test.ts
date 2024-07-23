// credentials
import { account_id as socialContractAccountId } from '@test/credentials/localnet/social.test.near.json';

// controllers
import Social from './Social';
import { networkRPCs } from '@app/constants';

describe(`${Social.name}#getVersion`, () => {
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
