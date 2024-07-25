import { utils } from 'near-api-js';

interface ISigner {
  accountID: string;
  publicKey: string | utils.PublicKey;
}

export default ISigner;
