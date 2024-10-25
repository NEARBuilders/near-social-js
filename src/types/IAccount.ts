import { PublicKey } from '@near-js/crypto';

interface IAccount {
  accountID: string;
  publicKey: string | PublicKey;
}

export default IAccount;
