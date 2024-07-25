import { providers } from 'near-api-js';

interface IOptions {
  args?: unknown;
  contractId: string;
  method: string;
  provider: providers.JsonRpcProvider;
}

export default IOptions;
