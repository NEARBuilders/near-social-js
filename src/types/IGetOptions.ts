// types
import type IDefaultViewOptionsApiServer from './IDefaultViewOptionsApiServer';

interface IGetOptions extends IDefaultViewOptionsApiServer {
  keys: string[];
  returnDeleted?: boolean;
  withBlockHeight?: boolean;
  withNodeId?: boolean;
  useApiServer?: boolean;
}

export default IGetOptions;
