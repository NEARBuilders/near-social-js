interface ISocialApiServerGetArgsOptions {
  with_block_height?: boolean;
  return_deleted?: boolean;
  with_timestamp?: boolean;
}

interface ISocialApiServerGetArgs {
  keys: string[];
  blockHeight?: bigint;
  options?: ISocialApiServerGetArgsOptions;
}

export default ISocialApiServerGetArgs;
