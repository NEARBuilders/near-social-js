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
      useApiServer: false,
    });

    // assert
    expect(result).toEqual({});
  });

  it('should return the object from mainnet api server', async () => {
    //api server is only available for mainnet so we can't test this with the local test.
    //Hence for now, I have written a mainnet test.
    const client = new Social({
      contractId: socialContractAccountId,
      network: NetworkIDEnum.Mainnet,
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
