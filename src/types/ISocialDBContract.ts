import type { Contract } from 'near-api-js';

// enums
import { ViewMethodEnum } from '@app/enums';

// types
import type ISocialDBContractGetArgs from './ISocialDBContractGetArgs';

interface ISocialDBContract extends Contract {
  [ViewMethodEnum.Get]: (
    args: ISocialDBContractGetArgs
  ) => Promise<Record<string, unknown>>;
  [ViewMethodEnum.GetVersion]: () => Promise<string>;
}

export default ISocialDBContract;
