import type { QueryResponseKind } from '@near-js/types';

// types
import type IAccessKeyInfoViewRaw from './IAccessKeyInfoViewRaw';

interface IResponse extends QueryResponseKind {
  keys: IAccessKeyInfoViewRaw[];
}

export default IResponse;
