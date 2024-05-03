import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { cwd } from 'node:process';

// types
import type { IOptions } from './types';

/**
 * Deploys the token factory contract to the token account and initializes the token.
 * @param {IOptions} options - the options needed to deploy and initialize the token at the account.
 * @returns {Promise<void>} a promise that resolves to the token's metadata.
 */
export default async function deployAndInitializeContract({
  contractAccount,
  creatorAccount,
}: IOptions): Promise<void> {
  const contract = await readFile(
    resolve(cwd(), 'test', 'contracts', 'social_db.wasm')
  );

  // deploy the account
  await contractAccount.deployContract(contract);

  // initialize the contract
  await creatorAccount.functionCall({
    contractId: contractAccount.accountId,
    methodName: 'new',
  });
}
