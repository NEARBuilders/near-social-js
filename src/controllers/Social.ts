import type { AccessKeyView } from '@near-js/types';
import BigNumber from 'bignumber.js';
import { providers, transactions, utils } from 'near-api-js';

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
  UnknownNetworkError,
} from '@app/errors';

// types
import type {
  IGetOptions,
  IGrantWritePermissionWithAccountIdOptions,
  IGrantWritePermissionWithPublicKeyOptions,
  IIsWritePermissionGrantedWithAccountIdOptions,
  IIsWritePermissionGrantedWithPublicKeyOptions,
  INewSocialOptions,
  IRPCOptions,
  ISetOptions,
  IStorageDepositOptions,
  IStorageWithdrawOptions,
  ISocialDBContractGetArgs,
  ISocialApiServerGetArgs,
  ISocialDBContractGrantWritePermissionArgs,
  ISocialDBContractSetArgs,
  ISocialDBContractStorageBalance,
  ISocialDBContractIsWritePermissionGrantedArgs,
  ISocialDBContractStorageWithdrawArgs,
  ISocialDBContractStorageDepositArgs,
  IKeysOptions,
  ISocialApiServerKeysArgs,
  ISocialDBContractKeysArgs,
  IAccount,
  IIndexOptions,
  ISocialApiServerIndexArgs,
} from '@app/types';

// utils
import calculateRequiredDeposit from '@app/utils/calculateRequiredDeposit';
import parseKeysFromData from '@app/utils/parseKeysFromData';
import rpcURLFromNetworkID from '@app/utils/rpcURLFromNetworkID';
import validateAccountId from '@app/utils/validateAccountId';
import viewAccessKeyList from '@app/utils/rpcQueries/viewAccessKeyList';
import viewFunction from '@app/utils/rpcQueries/viewFunction';

export default class Social {
  // private variables
  private readonly _contractId: string;
  private readonly _provider: providers.JsonRpcProvider;
  private readonly _apiServer?: string;

  constructor(options?: INewSocialOptions) {
    this._contractId = options?.contractId || 'social.near';
    this._provider = Social._initializeProvider(options?.network);
    this._apiServer = options?.apiServer || 'https://api.near.social';
  }

  /**
   * private static methods
   */

  /**
   * Initializes the provider with the supplied network options. If the network options are empty, the default mainnet
   * is used.
   * @param {string | IRPCOptions} networkIDOrRPCOptions - [optional] a network ID or the RPC options to initialize a
   * provider.
   * @returns {providers.JsonRpcProvider} an initialized provider to query the network with.
   * @throws {UnknownNetworkError} if a network ID is supplied, but is not known.
   * @private
   * @static
   */
  private static _initializeProvider(
    networkIDOrRPCOptions?: string | IRPCOptions
  ): providers.JsonRpcProvider {
    let url: string | null;

    // if there is no network id/rpc details, default to mainnet
    if (!networkIDOrRPCOptions) {
      return new providers.JsonRpcProvider({ url: networkRPCs.mainnet });
    }

    // if there is a network id, attempt to get the rpc url
    if (typeof networkIDOrRPCOptions === 'string') {
      url = rpcURLFromNetworkID(networkIDOrRPCOptions);

      if (!url) {
        throw new UnknownNetworkError(networkIDOrRPCOptions);
      }

      return new providers.JsonRpcProvider({ url });
    }

    // otherwise, use the rpc details
    return new providers.JsonRpcProvider({
      url: networkIDOrRPCOptions.url,
      ...(networkIDOrRPCOptions.apiKey && {
        headers: {
          ['X-Api-Key']: networkIDOrRPCOptions.apiKey,
        },
      }),
    });
  }

  /**
   * private methods
   */

  /**
   * Gets the access key view.
   * @param {IAccount} account - the account ID and public key of the account.
   * @returns {Promise<AccessKeyView | null>} a promise that resolves to the access key view or null if the access key
   * for the given public key does not exist.
   * @private
   */
  private async _accessKeyView({
    accountID,
    publicKey,
  }: IAccount): Promise<AccessKeyView | null> {
    const accessKeys = await viewAccessKeyList({
      accountID,
      provider: this._provider,
    });

    return (
      accessKeys.find((value) => value.public_key === publicKey.toString())
        ?.access_key || null
    );
  }

  /**
   * Queries the node to get the latest block hash.
   * @returns {Promise<string>} a promise that resolves to the latest block hash. The hash will be a base58 encoded string.
   * @private
   */
  private async _latestBlockHash(): Promise<string> {
    const { sync_info } = await this._provider.status();

    return sync_info.latest_block_hash;
  }

  private async _storageBalanceOf(
    accountID: string
  ): Promise<ISocialDBContractStorageBalance | null> {
    const result = await viewFunction({
      args: {
        account_id: accountID,
      },
      contractId: this._contractId,
      method: ViewMethodEnum.StorageBalanceOf,
      provider: this._provider,
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
   * @public
   */
  public async get({
    keys,
    blockHeight,
    returnDeleted,
    withBlockHeight,
    withNodeId,
    withTimestamp,
    useApiServer = true,
  }: IGetOptions): Promise<Record<string, unknown>> {
    if (useApiServer) {
      return await (
        await fetch(this._apiServer + '/get', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            keys,
            blockHeight,
            ...((returnDeleted || withBlockHeight || withTimestamp) && {
              options: {
                with_block_height: withBlockHeight,
                return_deleted: returnDeleted,
                with_timestamp: withTimestamp,
              },
            }),
          } as ISocialApiServerGetArgs),
        })
      ).json();
    } else {
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
        args,
        contractId: this._contractId,
        method: ViewMethodEnum.Get,
        provider: this._provider,
      })) as Record<string, unknown>;
    }
  }

  /**
   * Retrieves a list of keys that match the specified path pattern.
   * This method is useful for querying data structure without reading actual values.
   * @param {IKeysOptions} options - The options for querying keys.
   * @param {string[]} options.keys - The set of key patterns to match.
   * @param {number} [options.blockHeight] - The block height to query from (optional).
   * @param {boolean} [options.returnDeleted] - Whether to include deleted keys in the result (optional).
   * @param {string} [options.returnType] - Specifies the type of data to return (optional).
   * @param {boolean} [options.valuesOnly] - If true, returns only values without keys (optional).
   * @param {boolean} [options.useApiServer=true] - Whether to use the API server or view function using RPC (default: true).
   * @returns {Promise<Record<string, unknown>>} A promise that resolves to the matching keys and their metadata.
   */
  public async keys({
    keys,
    blockHeight,
    returnDeleted,
    returnType,
    valuesOnly,
    useApiServer = true,
  }: IKeysOptions): Promise<Record<string, unknown>> {
    if (useApiServer) {
      return await (
        await fetch(this._apiServer + '/keys', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            keys,
            blockHeight,
            ...((returnDeleted || returnType || valuesOnly) && {
              options: {
                return_deleted: returnDeleted,
                return_type: returnType, //Server supports additional "History" type.
                values_only: valuesOnly,
              },
            }),
          } as ISocialApiServerKeysArgs),
        })
      ).json();
    } else {
      const args: ISocialDBContractKeysArgs = {
        keys,
        ...((returnDeleted || returnType || valuesOnly) && {
          options: {
            return_deleted: returnDeleted,
            return_type: returnType,
            values_only: valuesOnly,
          },
        }),
      };

      return (await viewFunction({
        args,
        contractId: this._contractId,
        method: ViewMethodEnum.Keys,
        provider: this._provider,
      })) as Record<string, unknown>;
    }
  }

  /**
   * Retrieves indexed values based on specified criteria from the Social API server.
   * This function allows querying of indexed data, which can be used
   * for efficient lookups of social interactions or custom indexed data. It supports
   * filtering by action type (e.g., likes, follows), specific keys, and optionally by
   * account IDs. The results can be ordered and paginated for flexible data retrieval.
   *
   * Use cases include:
   * - Fetching all 'like' actions for a specific post
   * - Retrieving recent 'follow' actions for a user
   * - Querying custom indexed data based on application-specific schemas
   *
   * @param {IIndexOptions} options - The options for querying indexed values.
   * @param {string} options.action - The index_type from the standard (e.g., 'like' in the path 'index/like').
   * @param {string} options.key - The inner indexed value from the standard.
   * @param {string|string[]} [options.accountId] - Optional. A string or array of account IDs to filter values.
   * @param {'asc'|'desc'} [options.order='asc'] - Optional. The order of results. Either 'asc' or 'desc'.
   * @param {number} [options.limit=100] - Optional. The number of values to return.
   * @param {number} [options.from] - Optional. The starting point for fetching results. Defaults to 0 or Max depending on order.
   * @returns {Promise<Record<string, unknown>>} A promise that resolves to an array of matched indexed values, ordered by blockHeight.
   */
  public async index({
    action,
    key,
    accountId,
    order,
    limit,
    from,
  }: IIndexOptions): Promise<Record<string, unknown>> {
    return await (
      await fetch(this._apiServer + '/index', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          key,
          ...((accountId || order || limit || from) && {
            options: {
              accountId: accountId,
              order: order,
              limit: limit,
              from: from,
            },
          }),
        } as ISocialApiServerIndexArgs),
      })
    ).json();
  }

  /**
   * Gets the current version of the social contract.
   * @returns {Promise<string>} a promise that resolves to the current version of the contract.
   * @public
   */
  public async getVersion(): Promise<string> {
    const version = await viewFunction({
      contractId: this._contractId,
      method: ViewMethodEnum.GetVersion,
      provider: this._provider,
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
   * @public
   */
  public async grantWritePermission(
    options:
      | IGrantWritePermissionWithAccountIdOptions
      | IGrantWritePermissionWithPublicKeyOptions
  ): Promise<transactions.Transaction> {
    const { account, blockHash, keys, nonce } = options;
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
      if (accountId !== account.accountID) {
        throw new KeyNotAllowedError(
          value,
          `key "${value}" does not belong to granter "${account.accountID}"`
        );
      }
    });

    if (!_blockHash) {
      _blockHash = await this._latestBlockHash();
    }

    if (!_nonce) {
      accessKeyView = await this._accessKeyView(account);

      if (!accessKeyView) {
        throw new AccountNotFoundError(
          account.accountID,
          `failed to get nonce for access key for "${account.accountID}" with public key "${account.publicKey.toString()}"`
        );
      }

      _nonce = accessKeyView.nonce + BigInt(1); // increment nonce as this will be a new transaction for the access key
    }

    return transactions.createTransaction(
      account.accountID,
      utils.PublicKey.fromString(account.publicKey.toString()),
      this._contractId,
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
   * @public
   */
  public async isWritePermissionGranted(
    options:
      | IIsWritePermissionGrantedWithAccountIdOptions
      | IIsWritePermissionGrantedWithPublicKeyOptions
  ): Promise<boolean> {
    const { key } = options;

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
      contractId: this._contractId,
      method: ViewMethodEnum.IsWritePermissionGranted,
      provider: this._provider,
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
   * @public
   */
  public async set({
    account,
    blockHash,
    data,
    nonce,
    refundUnusedDeposit,
  }: ISetOptions): Promise<transactions.Transaction> {
    const keys = parseKeysFromData(data);
    let _blockHash = blockHash || null;
    let _nonce = nonce || null;
    let accessKeyView: AccessKeyView | null;
    let deposit: BigNumber = new BigNumber('1');
    let storageBalance: ISocialDBContractStorageBalance | null;

    if (!_blockHash) {
      _blockHash = await this._latestBlockHash();
    }

    if (!_nonce) {
      accessKeyView = await this._accessKeyView(account);

      if (!accessKeyView) {
        throw new AccountNotFoundError(
          account.accountID,
          `failed to get nonce for access key for "${account.accountID}" with public key "${account.publicKey.toString()}"`
        );
      }

      _nonce = accessKeyView.nonce + BigInt(1); // increment nonce as this will be a new transaction for the access key
    }

    // for each key, check if the signer has been granted write permission for the key
    for (let i = 0; i < keys.length; i++) {
      if (
        (keys[i].split('/')[0] || '') !== account.accountID &&
        !(await this.isWritePermissionGranted({
          granteePublicKey: account.publicKey,
          key: keys[i],
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
        (value) => value === account.accountID
      )
    ) {
      storageBalance = await this._storageBalanceOf(account.accountID);

      deposit = calculateRequiredDeposit({
        data,
        storageBalance,
      });
    }

    return transactions.createTransaction(
      account.accountID,
      utils.PublicKey.fromString(account.publicKey.toString()),
      this._contractId,
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
   * @public
   */
  public async storageDeposit({
    account,
    blockHash,
    nonce,
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
      _blockHash = await this._latestBlockHash();
    }

    if (!_nonce) {
      accessKeyView = await this._accessKeyView(account);

      if (!accessKeyView) {
        throw new AccountNotFoundError(
          account.accountID,
          `failed to get nonce for access key for "${account.accountID}" with public key "${account.publicKey.toString()}"`
        );
      }

      _nonce = accessKeyView.nonce + BigInt(1); // increment nonce as this will be a new transaction for the access key
    }

    return transactions.createTransaction(
      account.accountID,
      utils.PublicKey.fromString(account.publicKey.toString()),
      this._contractId,
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
   * @public
   */
  public async storageWithdraw({
    account,
    blockHash,
    amount,
    nonce,
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
      _blockHash = await this._latestBlockHash();
    }

    if (!_nonce) {
      accessKeyView = await this._accessKeyView(account);

      if (!accessKeyView) {
        throw new AccountNotFoundError(
          account.accountID,
          `failed to get nonce for access key for "${account.accountID}" with public key "${account.publicKey.toString()}"`
        );
      }

      _nonce = accessKeyView.nonce + BigInt(1); // increment nonce as this will be a new transaction for the access key
    }

    return transactions.createTransaction(
      account.accountID,
      utils.PublicKey.fromString(account.publicKey.toString()),
      this._contractId,
      _nonce,
      actions,
      utils.serialize.base_decode(_blockHash)
    );
  }
}
