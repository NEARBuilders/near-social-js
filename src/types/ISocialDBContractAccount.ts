// types
import ISocialDBContractAccountSharedStorage from './ISocialDBContractAccountSharedStorage';
import type ISocialDBContractStorageTracker from './ISocialDBContractStorageTracker';

interface ISocialDBContractAccount {
  node_id: bigint;
  shared_storage?: ISocialDBContractAccountSharedStorage;
  storage_balance: bigint;
  storage_tracker: ISocialDBContractStorageTracker;
  used_bytes: bigint;
}

export default ISocialDBContractAccount;
