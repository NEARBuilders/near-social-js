interface ISocialDBContractSetArgsOptions {
  refund_unused_deposit?: boolean;
}

interface ISocialDBContractSetArgs {
  data: Record<string, Record<string, unknown>>;
  options?: ISocialDBContractSetArgsOptions;
}

export default ISocialDBContractSetArgs;
