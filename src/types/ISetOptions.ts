// types
import type IDefaultChangeOptions from './IDefaultChangeOptions';

interface ISetOptions extends IDefaultChangeOptions {
  data: Record<string, Record<string, unknown>>;
  deposit?: string;
  refundUnusedDeposit?: boolean;
}

export default ISetOptions;
