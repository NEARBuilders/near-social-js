import { Account, Near, utils } from 'near-api-js';

interface IOptions {
  creatorAccount: Account;
  initialBalanceInAtomicUnits?: bigint;
  nearConnection: Near;
  newAccountID: string;
  newAccountPublicKey: utils.PublicKey;
}

export default IOptions;
