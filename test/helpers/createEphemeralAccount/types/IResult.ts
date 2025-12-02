import { Account } from '@near-js/accounts';
import { KeyPairEd25519 } from '@near-js/crypto';

interface IResult {
  account: Account;
  keyPair: KeyPairEd25519;
}

export default IResult;
