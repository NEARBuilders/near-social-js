import type { Worker } from 'near-workspaces';

interface IOptions {
  initialBalanceInAtomicUnits?: string;
  worker: Worker;
}

export default IOptions;
