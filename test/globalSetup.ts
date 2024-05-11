import { Account, connect, keyStores, utils } from 'near-api-js';
import { resolve } from 'node:path';
import { cwd } from 'node:process';
import { readFile } from 'node:fs/promises';

// constants
import { NETWORK_ID, NODE_URL } from './constants';

// credentials
import { account_id as genesisAccountId } from './credentials/localnet/test.near.json';
import { account_id as socialContractAccountId } from './credentials/localnet/test.near.json';

// helpers
import createTestAccount from './helpers/createTestAccount';

// utils
import convertNEARToYoctoNEAR from '../src/utils/convertNEARToYoctoNEAR';

export default async function globalSetup() {
  const _functionName = 'globalSetup';
  const near = await connect({
    networkId: NETWORK_ID,
    nodeUrl: NODE_URL,
    keyStore: new keyStores.UnencryptedFileSystemKeyStore(
      resolve(cwd(), 'test', 'credentials')
    ),
  });
  const contract = await readFile(
    resolve(cwd(), 'test', 'contracts', 'social_db.wasm')
  );
  let contractAccountPublicKey: utils.PublicKey;
  let contractAccount: Account;
  let genesisAccount: Account;

  genesisAccount = await near.account(genesisAccountId);
  contractAccountPublicKey = await near.connection.signer.getPublicKey(
    socialContractAccountId,
    NETWORK_ID
  );

  // create the contract account
  contractAccount = await createTestAccount({
    creatorAccount: genesisAccount,
    initialBalanceInAtomicUnits: BigInt(convertNEARToYoctoNEAR('10')),
    newAccountID: socialContractAccountId,
    newAccountPublicKey: contractAccountPublicKey,
    connection: near,
  });

  // deploy the account
  await contractAccount.deployContract(contract);

  try {
    // initialize the contract
    await genesisAccount.functionCall({
      contractId: contractAccount.accountId,
      methodName: 'new',
    });
    // set the contract to live
    await contractAccount.functionCall({
      contractId: contractAccount.accountId,
      methodName: 'set_status',
      args: {
        status: 'Live',
      },
    });
  } catch (error) {
    // if the contract has already been initialized, this will be thrown
    console.debug(`${_functionName}:`, error);
  }
}
