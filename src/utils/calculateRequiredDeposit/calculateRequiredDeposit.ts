import BigNumber from 'bignumber.js';

// constants
import {
  MINIMUM_STORAGE_IN_BYTES,
  STORAGE_COST_PER_BYTES_IN_ATOMIC_UNITS,
} from '@app/constants';
import { EXTRA_STORAGE_BALANCE } from './constants';

// types
import type { IOptions } from './types';

// utils
import calculateSizeOfData from '../calculateSizeOfData';

/**
 * Calculates the deposit required for storage. If the storage balance is not available, a minimum storage cost is
 * required. However, if the cost of the data exceeds the minimum storage cost, the cost of the data is used. In the
 * instances that there is storage balance available, the deposit is determined based on the difference between the
 * available and the required amount.
 * @param {IOptions} options - the data to be stored and the storage balance.
 * @returns {BigNumber} the required deposit.
 */
export default function calculateRequiredDeposit({
  data,
  storageBalance,
}: IOptions): BigNumber {
  const minimumStorageCost: BigNumber = new BigNumber(
    MINIMUM_STORAGE_IN_BYTES
  ).multipliedBy(new BigNumber(STORAGE_COST_PER_BYTES_IN_ATOMIC_UNITS));
  const storageCostOfData: BigNumber = new BigNumber(
    String(calculateSizeOfData(data))
  )
    .plus(EXTRA_STORAGE_BALANCE) // https://github.com/NearSocial/VM/blob/6047c6a9b96f3de14e600c1d2b96c432bbb76dd4/src/lib/data/commitData.js#L62
    .multipliedBy(STORAGE_COST_PER_BYTES_IN_ATOMIC_UNITS);
  let storageDepositAvailable: BigNumber;

  // if there is no balance, use the minimum storage cost, or the storage cost of the data
  if (!storageBalance) {
    return storageCostOfData.lt(minimumStorageCost)
      ? minimumStorageCost
      : storageCostOfData;
  }

  storageDepositAvailable = new BigNumber(storageBalance.available.toString());

  // if the storage deposit available is less than the cost of storage, use the difference as the required deposit
  return storageDepositAvailable.lt(storageCostOfData)
    ? storageCostOfData.minus(storageDepositAvailable)
    : new BigNumber('0');
}
