// types
import type IDefaultChangeOptions from './IDefaultChangeOptions';

interface ISetOptions extends IDefaultChangeOptions {
  data: Record<string, Record<string, unknown>>;
  refundUnusedDeposit?: boolean;
}

export default ISetOptions;
