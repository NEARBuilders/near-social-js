interface IGetOptions {
  keys: string[];
  returnDeleted?: boolean;
  withBlockHeight?: boolean;
  withNodeId?: boolean;
}

export default IGetOptions;
