import { Account, transactions } from 'near-api-js';

interface IOptions {
  signerAccount: Account;
  transaction: transactions.Transaction;
}

export default IOptions;
