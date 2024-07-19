// types
import type IDefaultViewOptionsApiServer from './IDefaultViewOptionsApiServer';

interface IGetOptions extends IDefaultViewOptionsApiServer {
  keys: string[];
  blockHeight?: bigint;
  returnDeleted?: boolean;
  withBlockHeight?: boolean;
  withNodeId?: boolean;
  useApiServer?: boolean;
  withTimestamp?: boolean;
}

export default IGetOptions;
