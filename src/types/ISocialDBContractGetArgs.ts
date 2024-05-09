interface ISocialDBContractGetArgsOptions {
  with_block_height?: boolean;
  with_node_id?: boolean;
  return_deleted?: boolean;
}

interface ISocialDBContractGetArgs {
  keys: string[];
  options?: ISocialDBContractGetArgsOptions;
}

export default ISocialDBContractGetArgs;
