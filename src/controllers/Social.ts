import BigNumber from 'bignumber.js';
import { transactions, utils } from 'near-api-js';

// constants
import {
  GAS_FEE_IN_ATOMIC_UNITS,
  MINIMUM_STORAGE_IN_BYTES,
  STORAGE_COST_PER_BYTES_IN_ATOMIC_UNITS,
} from '@app/constants';

// enums
import { ChangeMethodEnum, ViewMethodEnum } from '@app/enums';

// errors
import { InvalidAccountIdError, KeyNotAllowedError } from '@app/errors';

// types
import type {
  IGetOptions,
  IGetVersionOptions,
  IGrantWritePermissionOptions,
  IIsWritePermissionGrantedOptions,
  INewSocialOptions,
  ISetOptions,
  ISocialDBContractGetArgs,
  ISocialDBContractGrantWritePermissionArgs,
  ISocialDBContractSetArgs,
  ISocialDBContractStorageBalance,
  IStorageBalanceOfOptions,
  ISocialDBContractStorageDepositArgs,
  ISocialDBContractIsWritePermissionGrantedArgs,
} from '@app/types';

// utils
import validateAccountId from '@app/utils/validateAccountId';

export default class Social {
  private contractId: string;

  constructor(options?: INewSocialOptions) {
    this.contractId = options?.contractId || 'social.near';
  }

  /**
   * private methods
   */

  private async _storageBalanceOf({
    accountId,
    signer,
  }: IStorageBalanceOfOptions): Promise<ISocialDBContractStorageBalance | null> {
    return await signer.viewFunction({
      args: {
        account_id: accountId,
      },
      contractId: this.contractId,
      methodName: ViewMethodEnum.StorageBalanceOf,
    });
  }

  private _uniqueAccountIdsFromKeys(keys: string[]): string[] {
    return keys.reduce<string[]>((acc, currentValue) => {
      const accountId = currentValue.split('/')[0] || '';

      return acc.find((value) => value === accountId)
        ? acc
        : [...acc, currentValue];
    }, []);
  }

  /**
   * public methods
   */

  /**
   * Reads the data for given set of keys.
   * @param {IGetOptions} options - the signer and a set of keys to read.
   * @returns {Promise<Record<string, unknown>>} a promise that resolves to the given data.
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

  /**
   * Grants permission for a set of keys and an account, specified by the `options.granteeAccountId`.
   * The `options.signer` must be the owner of the set of keys.
   * @param {IGrantWritePermissionOptions} options - the list of keys and the grantee account ID.
   * @returns {Promise<transactions.Transaction>} a promise that resolves to a transaction that is ready to be signed
   * and sent to the network.
   * @throws {InvalidAccountIdError} if the grantee account ID or the account ID specified in the keys is invalid.
   * @throws {KeyNotAllowedError} if account IDs specified in the keys does not match the signer (granter) account ID.
   */
  public async grantWritePermission({
    blockHash,
    granteeAccountId,
    keys,
    nonce,
    publicKey,
    signer,
  }: IGrantWritePermissionOptions): Promise<transactions.Transaction> {
    if (!validateAccountId(granteeAccountId)) {
      throw new InvalidAccountIdError(
        granteeAccountId,
        `the grantee account id is not valid`
      );
    }

    // validate the keys
    keys.forEach((value) => {
      const accountId = value.split('/')[0] || '';

      if (!validateAccountId(accountId)) {
        throw new InvalidAccountIdError(accountId);
      }

      // if the key does not belong to the signer (granter) it cannot give grant permission
      if (accountId !== signer.accountId) {
        throw new KeyNotAllowedError(
          value,
          `key "${value}" does not belong to granter "${signer.accountId}"`
        );
      }
    });

    return transactions.createTransaction(
      signer.accountId,
      utils.PublicKey.fromString(publicKey.toString()),
      this.contractId,
      nonce,
      [
        transactions.functionCall(
          ChangeMethodEnum.GrantWritePermission,
          {
            keys,
            predecessor_id: granteeAccountId,
          } as ISocialDBContractGrantWritePermissionArgs,
          BigInt(GAS_FEE_IN_ATOMIC_UNITS),
          BigInt('1')
        ),
      ],
      utils.serialize.base_decode(blockHash)
    );
  }

  /**
   * Checks if an account, specified in `options.granteeAccountId`, has been granted write access for a key. If the
   * signer and the supplied `options.granteeAccountId` match, true will be returned.
   * @param {IGrantWritePermissionOptions} options - the key and the grantee account ID.
   * @returns {Promise<boolean>} true, if the grantee account ID has write access for the given key.
   * @throws {InvalidAccountIdError} if the grantee account ID is not a valid account ID.
   */
  public async isWritePermissionGranted({
    granteeAccountId,
    key,
    signer,
  }: IIsWritePermissionGrantedOptions): Promise<boolean> {
    if (!validateAccountId(granteeAccountId)) {
      throw new InvalidAccountIdError(
        granteeAccountId,
        `the grantee account id is not valid`
      );
    }

    // if the signer is the grantee, it has permission to write to itself
    if (signer.accountId === granteeAccountId) {
      return true;
    }

    return await signer.viewFunction({
      contractId: this.contractId,
      methodName: ViewMethodEnum.IsWritePermissionGranted,
      args: {
        key,
        predecessor_id: granteeAccountId,
      } as ISocialDBContractIsWritePermissionGrantedArgs,
    });
  }

  /**
   * Stores some data to the contract for a given set of keys. The `options.data`'s top-level key should be an account
   * ID to which the nested data is stored. The signer's public key should have permission to write to the
   * aforementioned account IDs.
   * @param {ISetOptions} options - the necessary options to set some data.
   * @returns {Promise<transactions.Transaction>} a promise that resolves to a transaction that is ready to be signed
   * and sent to the network.
   */
  public async set({
    blockHash,
    data,
    nonce,
    publicKey,
    refundUnusedDeposit,
    signer,
  }: ISetOptions): Promise<transactions.Transaction> {
    const uniqueAccountIds = Object.keys(data)
      .filter(validateAccountId)
      .reduce<string[]>(
        (acc, currentValue) =>
          acc.find((value) => value === currentValue)
            ? acc
            : [...acc, currentValue],
        []
      ); // filter out only valid account ids
    const actions: transactions.Action[] = [];

    // for each account, check if there is storage, if there isn't, add an action to deposit the minimum storage
    for (let i = 0; i < uniqueAccountIds.length; i++) {
      if (
        !(await this._storageBalanceOf({
          accountId: uniqueAccountIds[i],
          signer,
        }))
      ) {
        actions.push(
          transactions.functionCall(
            ChangeMethodEnum.StorageDeposit,
            {
              account_id: uniqueAccountIds[i],
              registration_only: true,
            } as ISocialDBContractStorageDepositArgs,
            BigInt(GAS_FEE_IN_ATOMIC_UNITS),
            BigInt(
              new BigNumber(MINIMUM_STORAGE_IN_BYTES)
                .multipliedBy(
                  new BigNumber(STORAGE_COST_PER_BYTES_IN_ATOMIC_UNITS)
                )
                .toFixed()
            ) // minimum storage cost
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
        actions.length <= 0 ? BigInt('1') : BigInt('0')
      )
    );

    return transactions.createTransaction(
      signer.accountId,
      utils.PublicKey.fromString(publicKey.toString()),
      this.contractId,
      nonce,
      actions,
      utils.serialize.base_decode(blockHash)
    );
  }

  /**
   * Sets the new social contract ID.
   * @param {string} contractId - the account of the new social contract ID.
   */
  public setContractId(contractId: string): void {
    this.contractId = contractId;
  }
}
