import type { Account } from 'near-api-js';

interface INewOptions {
  contractId?: string;
  signer: Account;
}

export default INewOptions;
