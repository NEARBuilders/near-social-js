export interface TransformedAction {
  type: 'FunctionCall';
  params: {
    methodName: string;
    args: Uint8Array;
    gas: bigint;
    deposit: bigint;
  };
}
