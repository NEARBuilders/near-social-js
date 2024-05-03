import type { Contract } from 'near-api-js';

interface ISocialDBContract extends Contract {
  get_version: () => Promise<string>;
}

export default ISocialDBContract;
