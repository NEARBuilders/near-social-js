import { Account, Near, utils } from 'near-api-js';

interface IOptions {
  connection: Near;
  creatorAccount: Account;
  initialBalanceInAtomicUnits?: bigint;
  newAccountID: string;
  newAccountPublicKey: utils.PublicKey;
}

export default IOptions;
