import { PublicKey } from '@near-js/crypto';
import { Account } from '@near-js/accounts';
import { Near } from 'near-api-js';

interface IOptions {
  connection: Near;
  creatorAccount: Account;
  initialBalanceInAtomicUnits?: bigint;
  newAccountID: string;
  newAccountPublicKey: PublicKey;
}

export default IOptions;
