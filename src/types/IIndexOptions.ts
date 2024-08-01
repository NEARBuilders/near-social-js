interface IIndexOptions {
  action: string;
  key:
    | string
    | {
        type?: string;
        path?: string;
        blockHeight?: number;
      };
  accountId?: string;
  order?: string;
  limit?: string;
  from?: string;
}

export default IIndexOptions;
