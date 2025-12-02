// types
import type { ISocialDBContractStorageBalance } from '@app/types';

interface IOptions {
  data: Record<string, Record<string, unknown>>;
  storageBalance: ISocialDBContractStorageBalance | null;
}

export default IOptions;
