// types
import type IDefaultViewOptionsApiServer from './IDefaultViewOptionsApiServer';

interface IGetOptions extends IDefaultViewOptionsApiServer {
  keys: string[];
  blockHeight?: bigint;
  returnDeleted?: boolean;
  returnType?: boolean;
  valuesOnly?: boolean;
  useApiServer?: boolean;
}

export default IGetOptions;
