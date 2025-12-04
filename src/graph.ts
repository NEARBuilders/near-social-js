import { Amount, Near, Network } from 'near-kit';
import { DEFAULT_API_SERVER, DEFAULT_CONTRACT_ID } from './constants';
import { InvalidAccountIdError, KeyNotAllowedError } from './errors';
import type {
  GetAccountOptions,
  GetAccountsOptions,
  GetNodeOptions,
  GetNodesOptions,
  GetOptions,
  GrantWritePermissionOptions,
  GraphOptions,
  IndexOptions,
  IsWritePermissionGrantedOptions,
  KeysOptions,
  SetOptions,
  StorageBalance,
  StorageBalanceResult,
  StorageDepositOptions,
  StorageUnregisterOptions,
  StorageWithdrawOptions,
} from './types';
import {
  calculateRequiredDeposit,
  parseKeysFromData,
  uniqueAccountIdsFromKeys,
  validateAccountId,
} from './utils';

export class Graph {
  private readonly near: Near;
  private readonly contractId: string;
  private readonly apiServer: string;
  private readonly defaultUseApiServer: boolean;

  constructor(options?: GraphOptions) {
    this.contractId = options?.contractId ?? DEFAULT_CONTRACT_ID;
    this.apiServer = options?.apiServer ?? DEFAULT_API_SERVER;
    this.defaultUseApiServer = options?.useApiServer ?? true;

    if (options?.near) {
      this.near = options.near;
    } else {
      this.near = new Near({
        network: (options?.network ?? 'mainnet') as Network,
      });
    }
  }

  private async fetchFromApi<T>(
    endpoint: string,
    body: Record<string, unknown>
  ): Promise<T> {
    const response = await fetch(this.apiServer + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return response.json();
  }

  async get({
    keys,
    blockHeight,
    returnDeleted,
    withBlockHeight,
    withNodeId,
    withTimestamp,
    useApiServer,
  }: GetOptions): Promise<Record<string, unknown>> {
    const shouldUseApi = useApiServer ?? this.defaultUseApiServer;
    if (shouldUseApi) {
      return this.fetchFromApi('/get', {
        keys,
        blockHeight,
        ...((returnDeleted || withBlockHeight || withTimestamp) && {
          options: {
            with_block_height: withBlockHeight,
            return_deleted: returnDeleted,
            with_timestamp: withTimestamp,
          },
        }),
      });
    }

    return this.near.view<Record<string, unknown>>(this.contractId, 'get', {
      keys,
      ...((returnDeleted || withBlockHeight || withNodeId) && {
        options: {
          with_block_height: withBlockHeight,
          with_node_id: withNodeId,
          return_deleted: returnDeleted,
        },
      }),
    });
  }

  async keys({
    keys,
    blockHeight,
    returnDeleted,
    returnType,
    valuesOnly,
    useApiServer,
  }: KeysOptions): Promise<Record<string, unknown>> {
    const shouldUseApi = useApiServer ?? this.defaultUseApiServer;
    if (shouldUseApi) {
      return this.fetchFromApi('/keys', {
        keys,
        blockHeight,
        ...((returnDeleted || returnType || valuesOnly) && {
          options: {
            return_deleted: returnDeleted,
            return_type: returnType,
            values_only: valuesOnly,
          },
        }),
      });
    }

    return this.near.view(this.contractId, 'keys', {
      keys,
      ...((returnDeleted || returnType || valuesOnly) && {
        options: {
          return_deleted: returnDeleted,
          return_type: returnType,
          values_only: valuesOnly,
        },
      }),
    });
  }

  async index({
    action,
    key,
    accountId,
    order,
    limit,
    from,
  }: IndexOptions): Promise<unknown[]> {
    return this.fetchFromApi('/index', {
      action,
      key,
      ...((accountId || order || limit || from) && {
        options: { accountId, order, limit, from },
      }),
    });
  }

  async getVersion(): Promise<string> {
    const version = await this.near.view<string>(
      this.contractId,
      'get_version',
      {}
    );
    if (typeof version !== 'string') {
      throw new Error(
        `Unexpected response format from get_version: ${JSON.stringify(version)}`
      );
    }
    return version;
  }

  async getAccount({
    accountId,
  }: GetAccountOptions): Promise<Record<string, unknown> | null> {
    return this.near.view(this.contractId, 'get_account', {
      account_id: accountId,
    });
  }

  async getAccounts({ fromIndex, limit }: GetAccountsOptions = {}): Promise<
    Record<string, unknown>
  > {
    return this.near.view(this.contractId, 'get_accounts', {
      ...(fromIndex !== undefined && { from_index: fromIndex }),
      ...(limit !== undefined && { limit }),
    });
  }

  async getAccountCount(): Promise<number> {
    const count = await this.near.view<number>(
      this.contractId,
      'get_account_count',
      {}
    );
    if (typeof count !== 'number') {
      throw new Error(
        `Unexpected response format from get_account_count: ${JSON.stringify(count)}`
      );
    }
    return count;
  }

  async getNode({
    nodeId,
    fromIndex,
    limit,
  }: GetNodeOptions): Promise<Record<string, unknown> | null> {
    return this.near.view(this.contractId, 'get_node', {
      node_id: nodeId,
      ...(fromIndex !== undefined && { from_index: fromIndex }),
      ...(limit !== undefined && { limit }),
    });
  }

  async getNodes({ fromIndex, limit }: GetNodesOptions = {}): Promise<
    Record<string, unknown>
  > {
    return this.near.view(this.contractId, 'get_nodes', {
      ...(fromIndex !== undefined && { from_index: fromIndex }),
      ...(limit !== undefined && { limit }),
    });
  }

  async getNodeCount(): Promise<number> {
    const count = await this.near.view<number>(
      this.contractId,
      'get_node_count',
      {}
    );
    if (typeof count !== 'number') {
      throw new Error(
        `Unexpected response format from get_node_count: ${JSON.stringify(count)}`
      );
    }
    return count;
  }

  async isWritePermissionGranted({
    key,
    granteeAccountId,
    granteePublicKey,
  }: IsWritePermissionGrantedOptions): Promise<boolean> {
    if (granteeAccountId) {
      if (!validateAccountId(granteeAccountId)) {
        throw new InvalidAccountIdError(
          granteeAccountId,
          'the grantee account id is not valid'
        );
      }
      if (granteeAccountId === (key.split('/')[0] || '')) {
        return true;
      }
    }

    const result = await this.near.view<boolean>(
      this.contractId,
      'is_write_permission_granted',
      {
        key,
        ...(granteeAccountId && { predecessor_id: granteeAccountId }),
        ...(granteePublicKey && { public_key: granteePublicKey }),
      }
    );

    if (typeof result !== 'boolean') {
      throw new Error(
        `Unexpected response format from is_write_permission_granted: ${JSON.stringify(result)}`
      );
    }
    return result;
  }

  async storageBalanceOf(
    accountId: string
  ): Promise<StorageBalanceResult | null> {
    const result = await this.near.view<StorageBalance | null>(
      this.contractId,
      'storage_balance_of',
      { account_id: accountId }
    );

    if (!result) return null;

    return {
      available: String(result.available),
      total: String(result.total),
    };
  }

  async set({ signerId, data, deposit, refundUnusedDeposit }: SetOptions) {
    const keys = parseKeysFromData(data);

    for (const key of keys) {
      const keyAccountId = key.split('/')[0] || '';
      if (keyAccountId !== signerId) {
        const hasPermission = await this.isWritePermissionGranted({
          key,
          granteeAccountId: signerId,
        });
        if (!hasPermission) {
          throw new KeyNotAllowedError(
            key,
            `the signer has not been granted write permission for "${key}"`
          );
        }
      }
    }

    let depositAmount: bigint;
    if (deposit) {
      depositAmount = BigInt(deposit);
    } else {
      const accountIds = uniqueAccountIdsFromKeys(keys);
      if (accountIds.includes(signerId)) {
        const storageBalance = await this.near.view<StorageBalance | null>(
          this.contractId,
          'storage_balance_of',
          { account_id: signerId }
        );
        const calculatedDeposit = calculateRequiredDeposit({
          data,
          storageBalance,
        });
        depositAmount = BigInt(calculatedDeposit.toFixed());
      } else {
        depositAmount = 1n;
      }
    }

    // if (depositAmount === 0n) {
    //   depositAmount = 1n;
    // }

    return this.near.transaction(signerId).functionCall(
      this.contractId,
      'set',
      {
        data,
        ...(refundUnusedDeposit && {
          options: { refund_unused_deposit: refundUnusedDeposit },
        }),
      },
      { gas: '100 Tgas', attachedDeposit: depositAmount }
    );
  }

  async grantWritePermission({
    signerId,
    keys,
    granteeAccountId,
    granteePublicKey,
  }: GrantWritePermissionOptions) {
    if (granteeAccountId && !validateAccountId(granteeAccountId)) {
      throw new InvalidAccountIdError(
        granteeAccountId,
        'the grantee account id is not valid'
      );
    }

    for (const key of keys) {
      const keyAccountId = key.split('/')[0] || '';

      if (!validateAccountId(keyAccountId)) {
        throw new InvalidAccountIdError(keyAccountId);
      }

      if (keyAccountId !== signerId) {
        throw new KeyNotAllowedError(
          key,
          `key "${key}" does not belong to granter "${signerId}"`
        );
      }
    }

    return this.near.transaction(signerId).functionCall(
      this.contractId,
      'grant_write_permission',
      {
        keys,
        ...(granteeAccountId && { predecessor_id: granteeAccountId }),
        ...(granteePublicKey && { public_key: granteePublicKey }),
      },
      { gas: '30 Tgas', attachedDeposit: Amount.ONE_YOCTO }
    );
  }

  async storageDeposit({
    signerId,
    accountId,
    deposit,
    registrationOnly,
  }: StorageDepositOptions) {
    const depositAmount = BigInt(deposit);
    return this.near.transaction(signerId).functionCall(
      this.contractId,
      'storage_deposit',
      {
        ...(accountId && { account_id: accountId }),
        ...(registrationOnly && { registration_only: registrationOnly }),
      },
      { gas: '30 Tgas', attachedDeposit: depositAmount }
    );
  }

  async storageWithdraw({ signerId, amount }: StorageWithdrawOptions) {
    return this.near
      .transaction(signerId)
      .functionCall(
        this.contractId,
        'storage_withdraw',
        { ...(amount && { amount }) },
        { gas: '30 Tgas', attachedDeposit: Amount.ONE_YOCTO }
      );
  }

  async storageUnregister({ signerId, force }: StorageUnregisterOptions) {
    return this.near
      .transaction(signerId)
      .functionCall(
        this.contractId,
        'storage_unregister',
        { ...(force !== undefined && { force }) },
        { gas: '30 Tgas', attachedDeposit: Amount.ONE_YOCTO }
      );
  }
}
