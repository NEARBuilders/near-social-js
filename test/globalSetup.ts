import { Account, utils } from 'near-api-js';
import { resolve } from 'node:path';
import { cwd } from 'node:process';
import { readFile } from 'node:fs/promises';

// constants
import {
  CAPTAIN_KIRK_ACCOUNT_ID,
  GENESIS_ACCOUNT_ID,
  SOCIAL_CONTRACT_ACCOUNT_ID,
  SPOCK_ACCOUNT_ID,
} from './constants';

// helpers
import convertNEARToYoctoNEAR from './helpers/convertNEARToYoctoNEAR';
import createNearConnection from './helpers/createNearConnection';
import createTestAccount from './helpers/createTestAccount';

export default async function globalSetup() {
  const _functionName = 'globalSetup';
  const connection = await createNearConnection({
    credentialsDir: resolve(cwd(), 'test', 'credentials'),
  });
  const contract = await readFile(
    resolve(cwd(), 'test', 'contracts', 'social_db.wasm')
  );
  const networkId = 'localnet';
  let contractAccountPublicKey: utils.PublicKey;
  let contractAccount: Account;
  let genesisAccount: Account;

  genesisAccount = await connection.account(GENESIS_ACCOUNT_ID);
  contractAccountPublicKey = await connection.connection.signer.getPublicKey(
    SOCIAL_CONTRACT_ACCOUNT_ID,
    networkId
  );

  // create known accounts
  await createTestAccount({
    connection,
    creatorAccount: genesisAccount,
    newAccountID: CAPTAIN_KIRK_ACCOUNT_ID,
    newAccountPublicKey: await connection.connection.signer.getPublicKey(
      CAPTAIN_KIRK_ACCOUNT_ID,
      networkId
    ),
  });
  await createTestAccount({
    connection,
    creatorAccount: genesisAccount,
    newAccountID: SPOCK_ACCOUNT_ID,
    newAccountPublicKey: await connection.connection.signer.getPublicKey(
      SPOCK_ACCOUNT_ID,
      networkId
    ),
  });

  // create the contract account
  contractAccount = await createTestAccount({
    creatorAccount: genesisAccount,
    initialBalanceInAtomicUnits: convertNEARToYoctoNEAR(BigInt('10')),
    newAccountID: SOCIAL_CONTRACT_ACCOUNT_ID,
    newAccountPublicKey: contractAccountPublicKey,
    connection: connection,
  });

  // deploy the account
  await contractAccount.deployContract(contract);

  try {
    // initialize the contract
    await genesisAccount.functionCall({
      contractId: contractAccount.accountId,
      methodName: 'new',
    });
  } catch (error) {
    console.debug(`${_functionName}:`, error);
  }
}
