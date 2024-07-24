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
  networkRPCs,
  ONE_YOCTO,
} from '@app/constants';

// enums
import { ChangeMethodEnum, ViewMethodEnum } from '@app/enums';

// errors
import {
  AccountNotFoundError,
  InvalidAccountIdError,
  KeyNotAllowedError,
} from '@app/errors';

// types
import type {
  IGetOptions,
  IGetVersionOptions,
  IGrantWritePermissionWithAccountIdOptions,
  IGrantWritePermissionWithPublicKeyOptions,
  IIsWritePermissionGrantedWithAccountIdOptions,
  IIsWritePermissionGrantedWithPublicKeyOptions,
  INewSocialOptions,
  ISetOptions,
  IStorageDepositOptions,
  IStorageWithdrawOptions,
  ISocialDBContractGetArgs,
  ISocialDBContractGrantWritePermissionArgs,
  ISocialDBContractSetArgs,
  ISocialDBContractStorageBalance,
  IStorageBalanceOfOptions,
  ISocialDBContractIsWritePermissionGrantedArgs,
  ISocialDBContractStorageWithdrawArgs,
  ISocialDBContractStorageDepositArgs,
  NetworkIds,
} from '@app/types';

// utils
import calculateRequiredDeposit from '@app/utils/calculateRequiredDeposit';
import parseKeysFromData from '@app/utils/parseKeysFromData';
import validateAccountId from '@app/utils/validateAccountId';
import viewFunction from '@app/utils/rpcQueries/viewFunction';

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
    rpcURL,
  }: IStorageBalanceOfOptions): Promise<ISocialDBContractStorageBalance | null> {
    const result = await viewFunction({
      contractId: this.contractId,
      method: ViewMethodEnum.StorageBalanceOf,
      args: {
        account_id: accountId,
      },
      rpcURL,
    });

    if (this._isStorageBalance(result)) {
      return result;
    } else if (result === null) {
      return null;
    } else {
      throw new Error('Unexpected response format from storage_balance_of');
    }
  }

  private _isStorageBalance(
    data: unknown
  ): data is ISocialDBContractStorageBalance {
    return (
      typeof data === 'object' &&
      data !== null &&
      'total' in data &&
      'available' in data &&
      typeof (data as ISocialDBContractStorageBalance).total === 'string' &&
      typeof (data as ISocialDBContractStorageBalance).available === 'string'
    );
  }

  private _uniqueAccountIdsFromKeys(keys: string[]): string[] {
    return keys.reduce<string[]>((acc, currentValue) => {
      const accountId = currentValue.split('/')[0] || '';

      return acc.find((value) => value === accountId)
        ? acc
        : [...acc, accountId];
    }, []);
  }

  /**
   * public methods
   */

  /**
   * Reads the data for given set of keys.
   * @param {IGetOptions} options - the set of keys to read and other options.
   * @returns {Promise<Record<string, unknown>>} a promise that resolves to the given data.
   */
  public async get({
    keys,
    returnDeleted,
    withBlockHeight,
    withNodeId,
    rpcURL,
  }: IGetOptions): Promise<Record<string, unknown>> {
    const args: ISocialDBContractGetArgs = {
      keys,
      ...((returnDeleted || withBlockHeight || withNodeId) && {
        options: {
          with_block_height: withBlockHeight,
          with_node_id: withNodeId,
          return_deleted: returnDeleted,
        },
      }),
    };

    return (await viewFunction({
      contractId: this.contractId,
      method: ViewMethodEnum.Get,
      args,
      rpcURL,
    })) as Record<string, unknown>;
  }

  /**
   * Gets the current version of the social contract.
   * @param {IGetVersionOptions} options - Optional parameters including rpcURL.
   * @returns {Promise<string>} a promise that resolves to the current version of the contract.
   */
  public async getVersion({ rpcURL }: IGetVersionOptions): Promise<string> {
    const version = await viewFunction({
      contractId: this.contractId,
      method: ViewMethodEnum.GetVersion,
      rpcURL,
    });

    if (typeof version !== 'string') {
      throw new Error(
        `Unexpected response format from get_version: ${JSON.stringify(version)}`
      );
    }
    return version;
  }

  /**
   * Grants permission for a set of keys and an account, specified by the `options.granteeAccountId`.
   * The `options.signer` must be the owner of the set of keys.
   * @param {IGrantWritePermissionWithAccountIdOptions | IGrantWritePermissionWithPublicKeyOptions} options - the list of keys and the grantee account ID.
   * @returns {Promise<transactions.Transaction>} a promise that resolves to a transaction that is ready to be signed
   * and sent to the network.
   * @throws {InvalidAccountIdError} if the grantee account ID or the account ID specified in the keys is invalid.
   * @throws {KeyNotAllowedError} if account IDs specified in the keys does not match the signer (granter) account ID.
   */
  public async grantWritePermission(
    options:
      | IGrantWritePermissionWithAccountIdOptions
      | IGrantWritePermissionWithPublicKeyOptions
  ): Promise<transactions.Transaction> {
    const { blockHash, keys, nonce, publicKey, signer } = options;
    let accessKeyView: AccessKeyView | null;
    let _blockHash: string | null = blockHash || null;
    let _nonce: bigint | null = nonce || null;

    if (
      (options as IGrantWritePermissionWithAccountIdOptions).granteeAccountId &&
      !validateAccountId(
        (options as IGrantWritePermissionWithAccountIdOptions).granteeAccountId
      )
    ) {
      throw new InvalidAccountIdError(
        (options as IGrantWritePermissionWithAccountIdOptions).granteeAccountId,
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

    if (!_blockHash) {
      _blockHash = await this._latestBlockHash(signer.connection);
    }

    if (!_nonce) {
      accessKeyView = await this._accessKeyView(signer, publicKey);

      if (!accessKeyView) {
        throw new AccountNotFoundError(
          signer.accountId,
          `failed to get nonce for access key for "${signer.accountId}" with public key "${publicKey.toString()}"`
        );
      }

      _nonce = accessKeyView.nonce + BigInt(1); // increment nonce as this will be a new transaction for the access key
    }

    return transactions.createTransaction(
      signer.accountId,
      utils.PublicKey.fromString(publicKey.toString()),
      this.contractId,
      _nonce,
      [
        transactions.functionCall(
          ChangeMethodEnum.GrantWritePermission,
          {
            keys,
            ...((options as IGrantWritePermissionWithAccountIdOptions)
              .granteeAccountId && {
              predecessor_id: (
                options as IGrantWritePermissionWithAccountIdOptions
              ).granteeAccountId,
            }),
            ...((options as IGrantWritePermissionWithPublicKeyOptions)
              .granteePublicKey && {
              public_key: (
                options as IGrantWritePermissionWithPublicKeyOptions
              ).granteePublicKey.toString(),
            }),
          } as ISocialDBContractGrantWritePermissionArgs,
          BigInt(GAS_FEE_IN_ATOMIC_UNITS),
          BigInt('1')
        ),
      ],
      utils.serialize.base_decode(_blockHash)
    );
  }

  /**
   * Checks if an account, specified in `options.granteeAccountId`, has been granted write access for a key. If the
   * signer and the supplied `options.granteeAccountId` match, true will be returned.
   * @param {IIsWritePermissionGrantedWithAccountIdOptions | IIsWritePermissionGrantedWithPublicKeyOptions} options - the key and the grantee account ID.
   * @returns {Promise<boolean>} a promise that resolves to true, if the grantee account ID has write access for the
   * given key, or false.
   * @throws {InvalidAccountIdError} if the grantee account ID is not a valid account ID.
   */
  public async isWritePermissionGranted(
    options:
      | IIsWritePermissionGrantedWithAccountIdOptions
      | IIsWritePermissionGrantedWithPublicKeyOptions
  ): Promise<boolean> {
    const { key, rpcURL } = options;

    if (
      (options as IIsWritePermissionGrantedWithAccountIdOptions)
        .granteeAccountId
    ) {
      if (
        !validateAccountId(
          (options as IIsWritePermissionGrantedWithAccountIdOptions)
            .granteeAccountId
        )
      ) {
        throw new InvalidAccountIdError(
          (
            options as IIsWritePermissionGrantedWithAccountIdOptions
          ).granteeAccountId,
          `the grantee account id is not valid`
        );
      }

      // if the grantee is the key account id, it has permission to write to itself
      if (
        (options as IIsWritePermissionGrantedWithAccountIdOptions)
          .granteeAccountId === (key.split('/')[0] || '')
      ) {
        return true;
      }
    }

    const result = await viewFunction({
      contractId: this.contractId,
      method: ViewMethodEnum.IsWritePermissionGranted,
      args: {
        key,
        ...((options as IIsWritePermissionGrantedWithAccountIdOptions)
          .granteeAccountId && {
          predecessor_id: (
            options as IIsWritePermissionGrantedWithAccountIdOptions
          ).granteeAccountId,
        }),
        ...((options as IIsWritePermissionGrantedWithPublicKeyOptions)
          .granteePublicKey && {
          public_key: (
            options as IIsWritePermissionGrantedWithPublicKeyOptions
          ).granteePublicKey.toString(),
        }),
      } as ISocialDBContractIsWritePermissionGrantedArgs,
      rpcURL,
    });

    if (typeof result !== 'boolean') {
      throw new Error(
        `Unexpected response format from isWritePermissionGranted: ${JSON.stringify(result)}`
      );
    }

    return result;
  }

  /**
   * Stores some data to the contract for a given set of keys. The `options.data`'s top-level key should be an account
   * ID to which the nested data is stored. The signer's public key should have permission to write to the keys.
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
    const keys = parseKeysFromData(data);
    let _blockHash: string | null = blockHash || null;
    let _nonce: bigint | null = nonce || null;
    let accessKeyView: AccessKeyView | null;
    let deposit: BigNumber = new BigNumber('1');
    let storageBalance: ISocialDBContractStorageBalance | null;

    if (!_blockHash) {
      _blockHash = await this._latestBlockHash(signer.connection);
    }

    if (!_nonce) {
      accessKeyView = await this._accessKeyView(signer, publicKey);

      if (!accessKeyView) {
        throw new AccountNotFoundError(
          signer.accountId,
          `failed to get nonce for access key for "${signer.accountId}" with public key "${publicKey.toString()}"`
        );
      }

      _nonce = accessKeyView.nonce + BigInt(1); // increment nonce as this will be a new transaction for the access key
    }

    const networkId = signer.connection.networkId as NetworkIds;
    const rpcURL = networkRPCs[networkId];
    // for each key, check if the signer has been granted write permission for the key
    for (let i = 0; i < keys.length; i++) {
      if (
        (keys[i].split('/')[0] || '') !== signer.accountId &&
        !(await this.isWritePermissionGranted({
          granteePublicKey: publicKey,
          key: keys[i],
          rpcURL,
        }))
      ) {
        throw new KeyNotAllowedError(
          keys[i],
          `the supplied public key has not been granted write permission for "${keys[i]}"`
        );
      }
    }

    // if the signer is updating their own data, calculate storage deposit
    if (
      this._uniqueAccountIdsFromKeys(keys).find(
        (value) => value === signer.accountId
      )
    ) {
      storageBalance = await this._storageBalanceOf({
        accountId: signer.accountId,
        rpcURL,
      });

      deposit = calculateRequiredDeposit({
        data,
        storageBalance,
      });
    }

    return transactions.createTransaction(
      signer.accountId,
      utils.PublicKey.fromString(publicKey.toString()),
      this.contractId,
      _nonce,
      [
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
          BigInt(deposit.toFixed())
        ),
      ],
      utils.serialize.base_decode(_blockHash)
    );
  }

  /**
   * Deposit NEAR to the social DB contract for covering storage for the given account_id or the signer if acount_id is not provided.
   * It also let you choose the option to pay bare minimum deposit for registering the account in the Social DB contract without any additional storage fees.
   * @param {IStorageDepositOptions} options - the necessary options to deposit NEAR for covering storage for the account_id or the signer.
   * @returns {Promise<transactions.Transaction>} a promise that resolves to a transaction that is ready to be signed
   * and sent to the network.
   */
  public async storageDeposit({
    blockHash,
    nonce,
    publicKey,
    signer,
    registrationOnly,
    accountId,
    deposit,
  }: IStorageDepositOptions): Promise<transactions.Transaction> {
    //should I filter valid account ids?
    const actions: transactions.Action[] = [];

    actions.push(
      transactions.functionCall(
        ChangeMethodEnum.StorageDeposit,
        {
          account_id: accountId,
          registration_only: registrationOnly,
        } as ISocialDBContractStorageDepositArgs,
        BigInt(GAS_FEE_IN_ATOMIC_UNITS),
        BigInt(deposit)
      )
    );

    let _blockHash: string | null = blockHash || null;
    let _nonce: bigint | null = nonce || null;
    let accessKeyView: AccessKeyView | null;

    if (!_blockHash) {
      _blockHash = await this._latestBlockHash(signer.connection);
    }

    if (!_nonce) {
      accessKeyView = await this._accessKeyView(signer, publicKey);

      if (!accessKeyView) {
        throw new AccountNotFoundError(
          signer.accountId,
          `failed to get nonce for access key for "${signer.accountId}" with public key "${publicKey.toString()}"`
        );
      }

      _nonce = accessKeyView.nonce + BigInt(1); // increment nonce as this will be a new transaction for the access key
    }

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
   * Withdraw available NEAR from the social DB contract for covering storage.
   * If amount is not specified than all available NEAR is withdrawn.
   * @param {IStorageWithdrawOptions} options - define the amount to be withdrawn.
   * @returns {Promise<transactions.Transaction>} a promise that resolves to a transaction that is ready to be signed
   * and sent to the network.
   */
  public async storageWithdraw({
    blockHash,
    amount,
    nonce,
    publicKey,
    signer,
  }: IStorageWithdrawOptions): Promise<transactions.Transaction> {
    const actions: transactions.Action[] = [];

    actions.push(
      transactions.functionCall(
        ChangeMethodEnum.StorageWithdraw,
        {
          amount,
        } as ISocialDBContractStorageWithdrawArgs,
        BigInt(GAS_FEE_IN_ATOMIC_UNITS),
        //the contract asserts for 1 yocto attached
        BigInt(ONE_YOCTO)
      )
    );

    let _blockHash: string | null = blockHash || null;
    let _nonce: bigint | null = nonce || null;
    let accessKeyView: AccessKeyView | null;

    if (!_blockHash) {
      _blockHash = await this._latestBlockHash(signer.connection);
    }

    if (!_nonce) {
      accessKeyView = await this._accessKeyView(signer, publicKey);

      if (!accessKeyView) {
        throw new AccountNotFoundError(
          signer.accountId,
          `failed to get nonce for access key for "${signer.accountId}" with public key "${publicKey.toString()}"`
        );
      }

      _nonce = accessKeyView.nonce + BigInt(1); // increment nonce as this will be a new transaction for the access key
    }

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
