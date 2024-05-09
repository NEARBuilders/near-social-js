import type { Contract } from 'near-api-js';

// enums
import { ViewMethodEnum } from '@app/enums';

interface ISocialDBContract extends Contract {
  [ViewMethodEnum.GetVersion]: () => Promise<string>;
}

export default ISocialDBContract;
