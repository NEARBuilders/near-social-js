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

describe(Social.name, () => {
  let signer: Account;
  let near: Near;

  beforeAll(async () => {
    near = await createNearConnection({
      credentialsDir: resolve(cwd(), 'test', 'credentials'),
    });
    signer = await near.account(GENESIS_ACCOUNT_ID);
  });

  describe('get', () => {
    it('should return the version of the social contract', async () => {
      // arrange
      const client = new Social({
        contractId: SOCIAL_CONTRACT_ACCOUNT_ID,
        signer,
      });
      // act
      const version = await client.getVersion();

      // assert
      expect(version).toMatchSnapshot();
    });
  });

  describe('getVersion', () => {
    it('should return the version of the social contract', async () => {
      // arrange
      const client = new Social({
        contractId: SOCIAL_CONTRACT_ACCOUNT_ID,
        signer,
      });
      // act
      const version = await client.getVersion();

      // assert
      expect(version).toMatchSnapshot();
    });
  });
});
