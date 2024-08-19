interface ISocialApiServerKeysArgsOptions {
  return_deleted?: boolean;
  return_type?: boolean;
  values_only?: boolean;
}

interface ISocialApiServerKeysArgs {
  keys: string[];
  blockHeight?: bigint;
  options?: ISocialApiServerKeysArgsOptions;
}

export default ISocialApiServerKeysArgs;
