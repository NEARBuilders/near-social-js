import { Account } from '@near-js/accounts';
import { Transaction } from '@near-js/transactions';

interface IOptions {
  signerAccount: Account;
  transaction: Transaction;
}

export default IOptions;
