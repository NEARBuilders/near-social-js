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
  ISocialDBContractGrantWritePermissionArgs,
  ISocialDBContractSetArgs,
  ISocialDBContractStorageBalance,
  ISocialDBContractIsWritePermissionGrantedArgs,
  ISocialDBContractStorageWithdrawArgs,
  ISocialDBContractStorageDepositArgs,
  ISigner,
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

  constructor(options?: INewSocialOptions) {
    this._contractId = options?.contractId || 'social.near';
    this._provider = Social._initializeProvider(options?.network);
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
   * @param {ISigner} account - the account ID and public key of the account.
   * @returns {Promise<AccessKeyView | null>} a promise that resolves to the access key view or null if the access key
   * for the given public key does not exist.
   * @private
   */
  private async _accessKeyView({
    accountID,
    publicKey,
  }: ISigner): Promise<AccessKeyView | null> {
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
    returnDeleted,
    withBlockHeight,
    withNodeId,
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
      args,
      contractId: this._contractId,
      method: ViewMethodEnum.Get,
      provider: this._provider,
    })) as Record<string, unknown>;
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
    const { blockHash, keys, nonce, signer } = options;
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
      if (accountId !== signer.accountID) {
        throw new KeyNotAllowedError(
          value,
          `key "${value}" does not belong to granter "${signer.accountID}"`
        );
      }
    });

    if (!_blockHash) {
      _blockHash = await this._latestBlockHash();
    }

    if (!_nonce) {
      accessKeyView = await this._accessKeyView(signer);

      if (!accessKeyView) {
        throw new AccountNotFoundError(
          signer.accountID,
          `failed to get nonce for access key for "${signer.accountID}" with public key "${signer.publicKey.toString()}"`
        );
      }

      _nonce = accessKeyView.nonce + BigInt(1); // increment nonce as this will be a new transaction for the access key
    }

    return transactions.createTransaction(
      signer.accountID,
      utils.PublicKey.fromString(signer.publicKey.toString()),
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
    blockHash,
    data,
    nonce,
    refundUnusedDeposit,
    signer,
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
      accessKeyView = await this._accessKeyView(signer);

      if (!accessKeyView) {
        throw new AccountNotFoundError(
          signer.accountID,
          `failed to get nonce for access key for "${signer.accountID}" with public key "${signer.publicKey.toString()}"`
        );
      }

      _nonce = accessKeyView.nonce + BigInt(1); // increment nonce as this will be a new transaction for the access key
    }

    // for each key, check if the signer has been granted write permission for the key
    for (let i = 0; i < keys.length; i++) {
      if (
        (keys[i].split('/')[0] || '') !== signer.accountID &&
        !(await this.isWritePermissionGranted({
          granteePublicKey: signer.publicKey,
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
        (value) => value === signer.accountID
      )
    ) {
      storageBalance = await this._storageBalanceOf(signer.accountID);

      deposit = calculateRequiredDeposit({
        data,
        storageBalance,
      });
    }

    return transactions.createTransaction(
      signer.accountID,
      utils.PublicKey.fromString(signer.publicKey.toString()),
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
    blockHash,
    nonce,
    registrationOnly,
    accountId,
    deposit,
    signer,
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
      accessKeyView = await this._accessKeyView(signer);

      if (!accessKeyView) {
        throw new AccountNotFoundError(
          signer.accountID,
          `failed to get nonce for access key for "${signer.accountID}" with public key "${signer.publicKey.toString()}"`
        );
      }

      _nonce = accessKeyView.nonce + BigInt(1); // increment nonce as this will be a new transaction for the access key
    }

    return transactions.createTransaction(
      signer.accountID,
      utils.PublicKey.fromString(signer.publicKey.toString()),
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
    blockHash,
    amount,
    nonce,
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
      _blockHash = await this._latestBlockHash();
    }

    if (!_nonce) {
      accessKeyView = await this._accessKeyView(signer);

      if (!accessKeyView) {
        throw new AccountNotFoundError(
          signer.accountID,
          `failed to get nonce for access key for "${signer.accountID}" with public key "${signer.publicKey.toString()}"`
        );
      }

      _nonce = accessKeyView.nonce + BigInt(1); // increment nonce as this will be a new transaction for the access key
    }

    return transactions.createTransaction(
      signer.accountID,
      utils.PublicKey.fromString(signer.publicKey.toString()),
      this._contractId,
      _nonce,
      actions,
      utils.serialize.base_decode(_blockHash)
    );
  }
}
