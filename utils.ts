import BigNumber from 'bignumber.js';
import {
  MINIMUM_STORAGE_IN_BYTES,
  STORAGE_COST_PER_BYTES_IN_ATOMIC_UNITS,
  EXTRA_STORAGE_BALANCE,
  ESTIMATED_KEY_VALUE_SIZE,
  ESTIMATED_NODE_SIZE,
} from './constants';
import type { StorageBalance } from './types';

export function validateAccountId(accountId: string): boolean {
  return (
    accountId.length >= 2 &&
    accountId.length <= 64 &&
    /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/.test(accountId)
  );
}

export function isObject(value: unknown): boolean {
  return (
    value === Object(value) &&
    !Array.isArray(value) &&
    typeof value !== 'function'
  );
}

type ParseValue = bigint | number | string | null | Record<string, unknown>;

export function parseKeysFromData(data: Record<string, unknown>): string[] {
  const parse = (keys: string[], value: ParseValue): string | string[] => {
    if (value === null || typeof value !== 'object') {
      return keys.join('/');
    }
    return Object.entries(value).flatMap(([key, val]) =>
      parse([...keys, key], val as ParseValue)
    );
  };
  return parse([], data) as string[];
}

export function calculateSizeOfData(
  data: Record<string, unknown> | string
): bigint {
  const calculate = (
    _data: unknown,
    previousData?: Record<string, unknown> | string
  ): bigint => {
    if (isObject(_data)) {
      return Object.entries(_data as Record<string, unknown>).reduce<bigint>(
        (acc, [key, value]) => {
          if (previousData && isObject(previousData)) {
            const prev = (previousData as Record<string, unknown>)[key] as
              | Record<string, unknown>
              | string
              | undefined;
            return acc + calculate(value, prev);
          }
          return (
            acc +
            BigInt(key.length * 2) +
            calculate(value) +
            BigInt(ESTIMATED_KEY_VALUE_SIZE)
          );
        },
        BigInt(isObject(previousData) ? 0 : ESTIMATED_NODE_SIZE)
      );
    }
    return BigInt(
      (typeof _data === 'string' ? _data.length : 8) -
        (previousData && typeof previousData === 'string'
          ? previousData.length
          : 0)
    );
  };
  return calculate(data);
}

export interface CalculateDepositOptions {
  data: Record<string, Record<string, unknown>>;
  storageBalance: StorageBalance | null;
}

export function calculateRequiredDeposit({
  data,
  storageBalance,
}: CalculateDepositOptions): BigNumber {
  const minimumStorageCost = new BigNumber(
    MINIMUM_STORAGE_IN_BYTES
  ).multipliedBy(new BigNumber(STORAGE_COST_PER_BYTES_IN_ATOMIC_UNITS));
  const storageCostOfData = new BigNumber(String(calculateSizeOfData(data)))
    .plus(EXTRA_STORAGE_BALANCE)
    .multipliedBy(STORAGE_COST_PER_BYTES_IN_ATOMIC_UNITS);

  if (!storageBalance) {
    return storageCostOfData.lt(minimumStorageCost)
      ? minimumStorageCost
      : storageCostOfData;
  }

  const storageDepositAvailable = new BigNumber(
    storageBalance.available.toString()
  );

  return storageDepositAvailable.lt(storageCostOfData)
    ? storageCostOfData.minus(storageDepositAvailable)
    : new BigNumber('0');
}

export function uniqueAccountIdsFromKeys(keys: string[]): string[] {
  return keys.reduce<string[]>((acc, currentValue) => {
    const accountId = currentValue.split('/')[0] || '';
    return acc.find((value) => value === accountId) ? acc : [...acc, accountId];
  }, []);
}
