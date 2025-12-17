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

/**
 * Extracts @mentions from text and returns an array of valid NEAR account IDs.
 * Mentions must start with @ followed by a valid NEAR account ID.
 * @param text - The text to extract mentions from
 * @returns An array of unique account IDs mentioned in the text
 */
export function extractMentions(text: string): string[] {
  // Match @accountId pattern - NEAR account IDs can contain lowercase letters, digits, hyphens, and underscores
  // They must be 2-64 characters and follow specific rules
  const mentionRegex = /@([a-z\d]+[-_]*[a-z\d]*(?:\.[a-z\d]+[-_]*[a-z\d]*)*)/gi;
  const matches = text.match(mentionRegex);

  if (!matches) {
    return [];
  }

  // Remove @ prefix and filter for valid account IDs
  const accountIds = matches
    .map((match) => match.slice(1).toLowerCase())
    .filter((accountId) => validateAccountId(accountId));

  // Return unique account IDs
  return [...new Set(accountIds)];
}

/**
 * Extracts #hashtags from text and returns an array of hashtag strings (without the # prefix).
 * @param text - The text to extract hashtags from
 * @returns An array of unique hashtags (lowercase, without # prefix)
 */
export function extractHashtags(text: string): string[] {
  // Match #hashtag pattern - hashtags can contain letters, numbers, and underscores
  const hashtagRegex = /#([a-zA-Z][a-zA-Z0-9_]*)/g;
  const matches = text.match(hashtagRegex);

  if (!matches) {
    return [];
  }

  // Remove # prefix and convert to lowercase
  const hashtags = matches.map((match) => match.slice(1).toLowerCase());

  // Return unique hashtags
  return [...new Set(hashtags)];
}

/**
 * Builds notification index data for mentioned accounts.
 * This creates the data structure needed to notify users when they are mentioned.
 * @param mentions - Array of account IDs that were mentioned
 * @param item - The item (post/comment) where the mentions occurred
 * @returns The notification index data structure to be stored
 */
export function buildNotifications(
  mentions: string[],
  item: { type: string; path: string; blockHeight: number }
): Record<string, string> | null {
  if (mentions.length === 0) {
    return null;
  }

  // Build notification entries for each mentioned account
  const notifications: Array<{ key: string; value: { type: string; item: typeof item } }> = 
    mentions.map((accountId) => ({
      key: accountId,
      value: {
        type: 'mention',
        item,
      },
    }));

  // Return as a JSON stringified object for index/notify
  return {
    notify: JSON.stringify(notifications.length === 1 ? notifications[0] : notifications),
  };
}