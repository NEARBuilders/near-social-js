import { Account, connect, Near } from 'near-api-js';
import { NearAccount, Worker } from 'near-workspaces';
import { resolve } from 'node:path';
import { cwd } from 'node:process';

// constants
import { NETWORK_ID } from '@test/constants';

// controllers
import Social from './Social';

// helpers
import createEphemeralAccount from '@test/helpers/createEphemeralAccount';

describe(`${Social.name}#get`, () => {
  let contractAccount: NearAccount;
  let near: Near;
  let signer: Account;
  let worker: Worker;

  beforeAll(async () => {
    worker = await Worker.init({
      network: NETWORK_ID,
    });

    contractAccount = await worker.rootAccount.devDeploy(
      resolve(cwd(), 'test', 'contracts', 'social_db.wasm')
    );
    await worker.rootAccount.call(contractAccount.accountId, 'new', {});

    near = await connect({
      networkId: NETWORK_ID,
      nodeUrl: worker.provider.connection.url,
    });
  });

  afterAll(async () => {
    await worker.tearDown();
  });

  beforeEach(async () => {
    const result = await createEphemeralAccount({
      worker,
    });

    signer = result.account;
  });

  it('should return an empty object when the contract does not know the account', async () => {
    // arrange
    const client = new Social({
      contractId: contractAccount.accountId,
    });
    // act
    const result = await client.get({
      keys: ['unknown.test.near/profile/name'],
      signer,
    });

    // assert
    expect(result).toEqual({});
  });
});
