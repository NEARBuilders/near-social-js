import { Account, Contract } from 'near-api-js';

// enums
import { ViewMethodEnum } from '@app/enums';

// types
import type {
  IGetOptions,
  INewSocialOptions,
  ISocialDBContract,
} from '@app/types';

export default class Social {
  private contract: ISocialDBContract;
  private signer: Account;

  constructor({ contractId, signer }: INewSocialOptions) {
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

  public async get(
    keys: string[],
    options?: IGetOptions
  ): Promise<Record<string, unknown>> {
    return await this.contract[ViewMethodEnum.Get]({
      keys,
      ...(options && {
        options: {
          ...(options.withBlockHeight && {
            with_block_height: options.withBlockHeight,
          }),
          ...(options.withNodeId && {
            with_node_id: options.withNodeId,
          }),
          ...(options.returnDeleted && {
            return_deleted: options.returnDeleted,
          }),
        },
      }),
    });
  }

  /**
   * Gets the current version of the social contract.
   * @returns {Promise<string>} a promise that resolves to the current version of the contract.
   */
  public async getVersion(): Promise<string> {
    return await this.contract[ViewMethodEnum.GetVersion]();
  }
}
