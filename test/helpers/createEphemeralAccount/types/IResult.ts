import { Account, utils } from 'near-api-js';

interface IResult {
  account: Account;
  keyPair: utils.KeyPairEd25519;
}

export default IResult;
