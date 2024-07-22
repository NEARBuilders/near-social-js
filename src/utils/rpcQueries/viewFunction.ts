import { providers } from 'near-api-js';
import { printTxOutcomeLogs } from '@near-js/utils';

// types
import type { IOptions } from './types';

type ViewFunctionResult =
  | string
  | number
  | boolean
  | null
  | object
  | unknown[]
  | undefined;

function parseJsonFromRawResponse(response: Uint8Array): ViewFunctionResult {
  return JSON.parse(Buffer.from(response).toString());
}

export default async function viewFunction({
  contractId,
  method,
  rpcURL,
  args = {},
}: IOptions): Promise<ViewFunctionResult> {
  const url = rpcURL || `https://rpc.mainnet.near.org`;
  const provider = new providers.JsonRpcProvider({ url });

  const res = await provider.query({
    request_type: 'call_function',
    account_id: contractId,
    method_name: method,
    args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
    finality: 'optimistic',
  });

  if ('logs' in res && Array.isArray(res.logs) && res.logs.length > 0) {
    printTxOutcomeLogs({ contractId, logs: res.logs });
  }

  if (
    'result' in res &&
    Array.isArray(res.result) &&
    res.result.length > 0 &&
    res.result !== undefined
  ) {
    return res.result && parseJsonFromRawResponse(Buffer.from(res.result));
  }

  return undefined;
}
