interface ISocialApiServerIndexArgsOptions {
  accountId?: string;
  order?: string;
  limit?: string;
  from?: string;
}

interface ISocialApiServerIndexArgs {
  action: string;
  key:
    | string
    | {
        type?: string;
        path?: string;
        blockHeight?: number;
      };
  options?: ISocialApiServerIndexArgsOptions;
}

export default ISocialApiServerIndexArgs;
