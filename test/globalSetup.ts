import { Account, utils } from 'near-api-js';
import { resolve } from 'node:path';
import { cwd } from 'node:process';
import { readFile } from 'node:fs/promises';

// constants
import { GENESIS_ACCOUNT_ID, SOCIAL_CONTRACT_ACCOUNT_ID } from './constants';

// helpers
import convertNEARToYoctoNEAR from './helpers/convertNEARToYoctoNEAR';
import createNearConnection from './helpers/createNearConnection';
import createTestAccount from './helpers/createTestAccount';

export default async function globalSetup() {
  const _functionName = 'globalSetup';
  const contract = await readFile(
    resolve(cwd(), 'test', 'contracts', 'social_db.wasm')
  );
  const near = await createNearConnection({
    credentialsDir: resolve(cwd(), 'test', 'credentials'),
  });
  let contractAccountPublicKey: utils.PublicKey;
  let contractAccount: Account;
  let creatorAccount: Account;

  creatorAccount = await near.account(GENESIS_ACCOUNT_ID);
  contractAccountPublicKey = await near.connection.signer.getPublicKey(
    SOCIAL_CONTRACT_ACCOUNT_ID,
    'localnet'
  );

  // create the contract account
  contractAccount = await createTestAccount({
    creatorAccount,
    initialBalanceInAtomicUnits: convertNEARToYoctoNEAR(BigInt('10')),
    newAccountID: SOCIAL_CONTRACT_ACCOUNT_ID,
    newAccountPublicKey: contractAccountPublicKey,
    nearConnection: near,
  });

  // deploy the account
  await contractAccount.deployContract(contract);

  try {
    // initialize the contract
    await creatorAccount.functionCall({
      contractId: contractAccount.accountId,
      methodName: 'new',
    });
  } catch (error) {
    console.error(`${_functionName}:`, error);
  }
}
