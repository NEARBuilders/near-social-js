import type { Near, Network } from 'near-kit';

// ============================================
// Graph Types
// ============================================

export interface GraphOptions {
  contractId?: string;
  network?: Network;
  apiServer?: string;
  near?: Near;
  useApiServer?: boolean;
}

export interface GetOptions {
  keys: string[];
  blockHeight?: bigint;
  returnDeleted?: boolean;
  withBlockHeight?: boolean;
  withNodeId?: boolean;
  withTimestamp?: boolean;
  useApiServer?: boolean;
}

export interface KeysOptions {
  keys: string[];
  blockHeight?: bigint;
  returnDeleted?: boolean;
  returnType?: string;
  valuesOnly?: boolean;
  useApiServer?: boolean;
}

export interface IndexOptions {
  action: string;
  key: string | { type?: string; path?: string; blockHeight?: number };
  accountId?: string | string[];
  order?: 'asc' | 'desc';
  limit?: number;
  from?: number;
}

export interface SetOptions {
  signerId: string;
  data: Record<string, Record<string, unknown>>;
  deposit?: string;
  refundUnusedDeposit?: boolean;
}

export interface GrantWritePermissionOptions {
  signerId: string;
  keys: string[];
  granteeAccountId?: string;
  granteePublicKey?: string;
}

export interface IsWritePermissionGrantedOptions {
  key: string;
  granteeAccountId?: string;
  granteePublicKey?: string;
}

export interface StorageDepositOptions {
  signerId: string;
  accountId?: string;
  deposit: string;
  registrationOnly?: boolean;
}

export interface StorageWithdrawOptions {
  signerId: string;
  amount?: string;
}

export interface StorageUnregisterOptions {
  signerId: string;
  force?: boolean;
}

export interface StorageBalance {
  available: bigint;
  total: bigint;
}

export interface StorageBalanceResult {
  available: string;
  total: string;
}

export interface GetAccountOptions {
  accountId: string;
}

export interface GetAccountsOptions {
  fromIndex?: number;
  limit?: number;
}

export interface GetNodeOptions {
  nodeId: number;
  fromIndex?: number;
  limit?: number;
}

export interface GetNodesOptions {
  fromIndex?: number;
  limit?: number;
}

// ============================================
// Social Types
// ============================================

export interface Profile {
  name?: string;
  description?: string;
  image?: {
    ipfs_cid?: string;
    url?: string;
  };
  backgroundImage?: {
    ipfs_cid?: string;
    url?: string;
  };
  linktree?: Record<string, string>;
  tags?: Record<string, string>;
  [key: string]: unknown;
}

export interface Post {
  text: string;
  type?: string;
  image?: {
    ipfs_cid?: string;
    url?: string;
  };
}

export interface PostWithMetadata extends Post {
  accountId: string;
  blockHeight: number;
}

export interface CommentItem {
  type: string;
  path: string;
  blockHeight: number;
}

export interface Comment {
  item: CommentItem;
  text: string;
  image?: {
    ipfs_cid?: string;
    url?: string;
  };
}

export interface FeedOptions {
  limit?: number;
  from?: number;
  order?: 'asc' | 'desc';
}

export interface AccountFeedOptions extends FeedOptions {
  includeReplies?: boolean;
}

export interface IndexEntry {
  accountId: string;
  blockHeight: number;
  value?: unknown;
}

export interface Notification {
  accountId: string;
  blockHeight: number;
  value: {
    type: string;
    item?: CommentItem;
    accountId?: string;
  };
}

export type SocialOptions = GraphOptions;
