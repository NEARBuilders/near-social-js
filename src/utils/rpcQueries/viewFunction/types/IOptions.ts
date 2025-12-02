import { JsonRpcProvider } from '@near-js/providers';

interface IOptions {
  args?: unknown;
  contractId: string;
  method: string;
  provider: JsonRpcProvider;
}

export default IOptions;
