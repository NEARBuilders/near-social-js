interface ISocialDBContractKeysArgsOptions {
  return_deleted?: boolean;
  return_type?: boolean;
  values_only?: boolean;
}

interface ISocialDBContractKeysArgs {
  keys: string[];
  blockHeight?: bigint;
  options?: ISocialDBContractKeysArgsOptions;
}

export default ISocialDBContractKeysArgs;
