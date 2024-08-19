import { providers } from 'near-api-js';

interface IOptions {
  accountID: string;
  provider: providers.JsonRpcProvider;
}

export default IOptions;
