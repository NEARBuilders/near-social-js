// types
import type ISigner from './ISigner';

interface IDefaultChangeOptions {
  blockHash?: string;
  nonce?: bigint;
  signer: ISigner;
}

export default IDefaultChangeOptions;
