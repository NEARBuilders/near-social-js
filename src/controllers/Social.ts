import type { AccessKeyView } from '@near-js/types';
import BigNumber from 'bignumber.js';
import {
  type Account,
  type Connection,
  transactions,
  utils,
} from 'near-api-js';

// constants
import {
  GAS_FEE_IN_ATOMIC_UNITS,
  MINIMUM_STORAGE_IN_BYTES,
  STORAGE_COST_PER_BYTES_IN_ATOMIC_UNITS,
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
  ISocialDBContractStorageBalance,
  IStorageBalanceOfOptions,
  ISocialDBContractStorageDepositArgs,
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

  /**
   * Gets the access key view.
   * @param {Account} account - an initialized account.
   * @param {string | utils.PublicKey} publicKey - the public key of the access key to query.
   * @returns {Promise<AccessKeyView | null>} a promise that resolves to the access key view or null if the access key
   * for the given public key does not exist.
   * @private
   */
  private async _accessKeyView(
    account: Account,
    publicKey: string | utils.PublicKey
  ): Promise<AccessKeyView | null> {
    const accessKeys = await account.getAccessKeys();

    return (
      accessKeys.find((value) => value.public_key === publicKey.toString())
        ?.access_key || null
    );
  }

  /**
   * Queries the node to get the latest block hash.
   * @param {Connection} connection - an initialized NEAR connection.
   * @returns {Promise<string>} a promise that resolves to the latest block hash. The hash will be a base58 encoded string.
   * @private
   */
  private async _latestBlockHash(connection: Connection): Promise<string> {
    const { sync_info } = await connection.provider.status();

    return sync_info.latest_block_hash;
  }

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
    let _blockHash: string | null = blockHash || null;
    let _nonce: bigint | null = nonce || null;
    let accessKeyView: AccessKeyView | null;

    if (!_blockHash) {
      _blockHash = await this._latestBlockHash(signer.connection);
    }

    if (!_nonce) {
      accessKeyView = await this._accessKeyView(signer, publicKey);

      // TODO: handle errors when 15-implement-function-for-grant-write-permission is merged
      if (!accessKeyView) {
        throw new Error(
          `failed to get nonce for access key for "${signer.accountId}" with public key "${publicKey.toString()}"`
        );
      }

      _nonce = accessKeyView.nonce + BigInt(1); // increment nonce as this will be a new transaction for the access key
    }

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
      _nonce,
      actions,
      utils.serialize.base_decode(_blockHash)
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
