// types
import type IAccount from './IAccount';

interface IDefaultChangeOptions {
  account: IAccount;
  blockHash?: string;
  nonce?: bigint;
}

export default IDefaultChangeOptions;
