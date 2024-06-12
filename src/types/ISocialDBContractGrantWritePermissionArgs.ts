import { utils } from 'near-api-js';

type ISocialDBContractGrantWritePermissionArgs =
  | {
      keys: string[];
      predecessor_id: string;
    }
  | {
      keys: string[];
      public_key: utils.PublicKey;
    };

export default ISocialDBContractGrantWritePermissionArgs;
