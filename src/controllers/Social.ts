import { transactions, utils } from 'near-api-js';

// constants
import {
  GAS_FEE_IN_ATOMIC_UNITS,
  STORAGE_FEE_IN_ATOMIC_UNITS,
} from '@app/constants';

// enums
import { ChangeMethodEnum, ViewMethodEnum } from '@app/enums';

// types
import type {
  IGetOptions,
  IGetVersionOptions,
  INewSocialOptions,
  ISetOptions,
  ISocialDBContractGetArgs,
  ISocialDBContractSetArgs,
  ISocialDBContractStorageBalanceOfArgs,
} from '@app/types';

// utils
import validateAccountId from '@app/utils/validateAccountId';

export default class Social {
  private contractId: string;

  constructor({ contractId }: INewSocialOptions) {
    this.contractId = contractId || 'social.near';
  }

  /**
   * public methods
   */

  public async get({
    signer,
    keys,
    returnDeleted,
    withBlockHeight,
    withNodeId,
  }: IGetOptions): Promise<Record<string, unknown>> {
    return await signer.viewFunction({
      contractId: this.contractId,
      methodName: ViewMethodEnum.Get,
      args: {
        keys,
        ...((returnDeleted || withBlockHeight || withNodeId) && {
          options: {
            with_block_height: withBlockHeight,
            with_node_id: withNodeId,
            return_deleted: returnDeleted,
          },
        }),
      } as ISocialDBContractGetArgs,
    });
  }

  /**
   * Gets the current version of the social contract.
   * @returns {Promise<string>} a promise that resolves to the current version of the contract.
   */
  public async getVersion({ signer }: IGetVersionOptions): Promise<string> {
    return await signer.viewFunction({
      contractId: this.contractId,
      methodName: ViewMethodEnum.GetVersion,
    });
  }

  public async set({
    blockHash,
    data,
    nonce,
    publicKey,
    refundUnusedDeposit,
    signer,
  }: ISetOptions): Promise<transactions.Transaction> {
    const accountIds = Object.keys(data).filter(validateAccountId); // filter out only valid account ids
    const uniqueAccountIds = accountIds.reduce<string[]>(
      (acc, currentValue) =>
        acc.find((value) => value === currentValue)
          ? acc
          : [...acc, currentValue],
      []
    );
    const actions: transactions.Action[] = [];

    // for each unique account, check if there is storage, if there isn't, add an action to register storage
    for (let i = 0; i < uniqueAccountIds.length; i++) {
      if (
        !(await signer.viewFunction({
          contractId: this.contractId,
          methodName: ViewMethodEnum.StorageBalanceOf,
          args: {
            account_id: uniqueAccountIds[i],
          } as ISocialDBContractStorageBalanceOfArgs,
        }))
      ) {
        actions.push(
          transactions.functionCall(
            ChangeMethodEnum.StorageDeposit,
            {
              account_id: uniqueAccountIds[i],
              registration_only: true,
            },
            BigInt(GAS_FEE_IN_ATOMIC_UNITS),
            BigInt(STORAGE_FEE_IN_ATOMIC_UNITS)
          )
        );
      }
    }

    actions.push(
      transactions.functionCall(
        ChangeMethodEnum.Set,
        {
          data,
          ...(refundUnusedDeposit && {
            options: {
              refund_unused_deposit: refundUnusedDeposit,
            },
          }),
        } as ISocialDBContractSetArgs,
        BigInt(GAS_FEE_IN_ATOMIC_UNITS),
        BigInt('0')
      )
    );

    return transactions.createTransaction(
      signer.accountId,
      publicKey,
      this.contractId,
      nonce,
      actions,
      utils.serialize.base_decode(blockHash)
    );
  }

  public setContractId(contractId: string): void {
    this.contractId = contractId;
  }
}
