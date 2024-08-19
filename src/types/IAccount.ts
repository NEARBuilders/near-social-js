import { utils } from 'near-api-js';

interface IAccount {
  accountID: string;
  publicKey: string | utils.PublicKey;
}

export default IAccount;
