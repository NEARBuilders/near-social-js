import { Contract, Near } from 'near-api-js';
import { resolve } from 'node:path';
import { cwd } from 'node:process';

// controllers
import Social from './Social';

// helpers
import createNearConnection from '@test/helpers/createNearConnection';

// types
import type { ISocialDBContract } from '@app/types';

describe(Social.name, () => {
  const contractAccountID = 'social.test.near';
  let near: Near;

  beforeAll(async () => {
    near = await createNearConnection({
      credentialsDir: resolve(cwd(), 'test', 'credentials'),
    });
  });

  it('should have initialized contract', async () => {
    // arrange
    const contract = new Contract(near.connection, contractAccountID, {
      changeMethods: [],
      viewMethods: ['get_version'],
      useLocalViewExecution: false,
    }) as ISocialDBContract;
    const result = await contract.get_version();

    // act
    // assert
    expect(result).toBeDefined();
  });
});
