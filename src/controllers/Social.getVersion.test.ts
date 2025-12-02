// credentials
import { account_id as socialContractAccountId } from '@test/credentials/localnet/social.test.near.json';

// controllers
import Social from './Social';

// enums
import { NetworkIDEnum } from '@app/enums';

describe(`${Social.name}#getVersion`, () => {
  it('should return the version of the social contract', async () => {
    // arrange
    const client = new Social({
      contractId: socialContractAccountId,
      network: NetworkIDEnum.Localnet,
    });
    // act
    const version = await client.getVersion();

    // assert
    expect(version).toMatchSnapshot();
  });
});
