import { Account, Contract } from 'near-api-js';

// enums
import { ViewMethodEnum } from '@app/enums';

// types
import type { INewOptions, ISocialDBContract } from '@app/types';

export default class Social {
  private contract: ISocialDBContract;
  private signer: Account;

  constructor({ contractId, signer }: INewOptions) {
    this.contract = new Contract(
      signer.connection,
      contractId || 'social.near',
      {
        changeMethods: [],
        viewMethods: Object.values(ViewMethodEnum),
        useLocalViewExecution: false,
      }
    ) as ISocialDBContract;
    this.signer = signer;
  }

  /**
   * public methods
   */

  /**
   * Gets the current version of the social contract.
   * @returns {Promise<string>} a promise that resolves to the current version of the contract.
   */
  public async getVersion(): Promise<string> {
    return await this.contract.get_version();
  }
}
