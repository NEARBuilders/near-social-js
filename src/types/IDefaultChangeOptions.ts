import { utils } from 'near-api-js';

interface IDefaultChangeOptions {
  blockHash?: string;
  nonce?: bigint;
  signerPublicKey: utils.PublicKey | string;
  signerAccountId: string;
}

export default IDefaultChangeOptions;
