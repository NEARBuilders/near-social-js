// types
import type IRPCOptions from './IRPCOptions';

interface INewSocialOptions {
  contractId?: string;
  network?: string | IRPCOptions;
  apiServer?: string;
}

export default INewSocialOptions;
