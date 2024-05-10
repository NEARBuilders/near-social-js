import type { Account, Near } from 'near-api-js';
import { resolve } from 'node:path';
import { cwd } from 'node:process';

// constants
import {
  GENESIS_ACCOUNT_ID,
  SOCIAL_CONTRACT_ACCOUNT_ID,
} from '@test/constants';

// controllers
import Social from './Social';

// helpers
import createNearConnection from '@test/helpers/createNearConnection';

describe(`${Social.name}#getVersion`, () => {
  let connection: Near;
  let signer: Account;

  beforeAll(async () => {
    connection = await createNearConnection({
      credentialsDir: resolve(cwd(), 'test', 'credentials'),
    });
    signer = await connection.account(GENESIS_ACCOUNT_ID);
  });

  it('should return the version of the social contract', async () => {
    // arrange
    const client = new Social({
      contractId: SOCIAL_CONTRACT_ACCOUNT_ID,
    });
    // act
    const version = await client.getVersion({ signer });

    // assert
    expect(version).toMatchSnapshot();
  });
});
