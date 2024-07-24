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
  return JSON.parse(new TextDecoder().decode(response));
}

function base64Encode(str: string): string {
  try {
    return btoa(str);
  } catch (err) {
    return Buffer.from(str).toString('base64');
  }
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
    args_base64: base64Encode(JSON.stringify(args)),
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
    return parseJsonFromRawResponse(new Uint8Array(res.result));
  }

  return undefined;
}
