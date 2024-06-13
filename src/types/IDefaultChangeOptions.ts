import { utils } from 'near-api-js';

// types
import type IDefaultOptions from './IDefaultOptions';

interface IDefaultChangeOptions extends IDefaultOptions {
  blockHash?: string;
  nonce?: bigint;
  publicKey: utils.PublicKey | string;
}

export default IDefaultChangeOptions;
