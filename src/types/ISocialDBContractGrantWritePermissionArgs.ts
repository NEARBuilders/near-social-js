import { PublicKey } from '@near-js/crypto';

type ISocialDBContractGrantWritePermissionArgs =
  | {
      keys: string[];
      predecessor_id: string;
    }
  | {
      keys: string[];
      public_key: PublicKey;
    };

export default ISocialDBContractGrantWritePermissionArgs;
