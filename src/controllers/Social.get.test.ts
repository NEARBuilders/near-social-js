// credentials
import { account_id as socialContractAccountId } from '@test/credentials/localnet/social.test.near.json';

// controllers
import Social from './Social';

// enums
import { NetworkIDEnum } from '@app/enums';

describe(`${Social.name}#get`, () => {
  it('should return an empty object when the contract does not know the account', async () => {
    // arrange
    const client = new Social({
      contractId: socialContractAccountId,
      network: NetworkIDEnum.Localnet,
    });
    // act
    const result = await client.get({
      keys: ['unknown.test.near/profile/name'],
    });

    // assert
    expect(result).toEqual({});
  });
});
