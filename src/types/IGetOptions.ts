// types
import type IDefaultViewOptions from './IDefaultViewOptions';

interface IGetOptions extends IDefaultViewOptions {
  keys: string[];
  returnDeleted?: boolean;
  withBlockHeight?: boolean;
  withNodeId?: boolean;
}

export default IGetOptions;
