import type { Account } from 'near-api-js';

interface IOptions {
  contractAccount: Account;
  creatorAccount: Account;
}

export default IOptions;
