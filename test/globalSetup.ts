import { Account } from '@near-js/accounts';
import { UnencryptedFileSystemKeyStore } from '@near-js/keystores-node';
import { connect } from 'near-api-js';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { cwd } from 'node:process';

// constants
import { NETWORK_ID, NODE_URL } from './constants';

// credentials
import { account_id as socialContractAccountId } from './credentials/localnet/social.test.near.json';
import { account_id as genesisAccountId } from './credentials/localnet/test.near.json';

// helpers
import createTestAccount from './helpers/createTestAccount';

// utils
import { PublicKey } from '@near-js/crypto';
import convertNEARToYoctoNEAR from '../src/utils/convertNEARToYoctoNEAR';

export default async function globalSetup() {
  const _functionName = 'globalSetup';
  const near = await connect({
    networkId: NETWORK_ID,
    nodeUrl: NODE_URL,
    keyStore: new UnencryptedFileSystemKeyStore(
      resolve(cwd(), 'test', 'credentials')
    ),
  });
  const contract = await readFile(
    resolve(cwd(), 'test', 'contracts', 'social_db.wasm')
  );
  let contractAccountPublicKey: PublicKey;
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
  await contractAccount.deployContract(new Uint8Array(contract));

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
    // if the contract has already been initialized, just ignore
    if (error.message.includes('The contract has already been initialized')) {
      return;
    }

    console.error(`${_functionName}:`, JSON.stringify(error));
  }
}
