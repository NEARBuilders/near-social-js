type ISocialDBContractIsWritePermissionGrantedArgs =
  | {
      key: string;
      predecessor_id: string;
    }
  | {
      key: string;
      public_key: Uint8Array;
    };

export default ISocialDBContractIsWritePermissionGrantedArgs;
