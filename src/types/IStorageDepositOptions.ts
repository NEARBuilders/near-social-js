// types
import type IDefaultChangeOptions from './IDefaultChangeOptions';

interface IStorageDepositOptions extends IDefaultChangeOptions {
  account_id?: string;
  registration_only?: boolean;
  deposit: string;
}

export default IStorageDepositOptions;
