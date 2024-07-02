// types
import type IDefaultChangeOptions from './IDefaultChangeOptions';

interface IStorageDepositOptions extends IDefaultChangeOptions {
  accountId?: string;
  registrationOnly?: boolean;
  deposit: string;
}

export default IStorageDepositOptions;
