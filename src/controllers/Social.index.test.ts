// credentials
import { account_id as socialContractAccountId } from '@test/credentials/localnet/social.test.near.json';

// controllers
import Social from './Social';

// enums
import { NetworkIDEnum } from '@app/enums';

describe(`${Social.name}#index`, () => {
  it('should return the object from mainnet api server', async () => {
    //api server is only available for mainnet so we can't test this with the local test.
    //Hence for now, I have written a mainnet test.
    const client = new Social({
      contractId: socialContractAccountId,
      network: NetworkIDEnum.Mainnet,
    });
    // act
    const result = await client.index({
      action: 'post',
      key: 'main',
      limit: '1',
    });

    expect(result).toEqual([
      { accountId: 'mob.near', blockHeight: 81101335, value: { type: 'md' } },
    ]);
  });
});
