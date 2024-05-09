import type { Account } from 'near-api-js';

interface INewSocialOptions {
  contractId?: string;
  signer: Account;
}

export default INewSocialOptions;
