interface IKeyOptions {
  keys: string[];
  blockHeight?: bigint;
  returnDeleted?: boolean;
  returnType?: boolean;
  valuesOnly?: boolean;
  useApiServer?: boolean;
}

export default IKeyOptions;
