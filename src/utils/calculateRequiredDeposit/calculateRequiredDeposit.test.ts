import BigNumber from 'bignumber.js';
import { randomBytes } from 'node:crypto';

// constants
import {
  MINIMUM_STORAGE_IN_BYTES,
  STORAGE_COST_PER_BYTES_IN_ATOMIC_UNITS,
} from '@app/constants';
import { EXTRA_STORAGE_BALANCE } from './constants';

// utils
import calculateSizeOfData from '../calculateSizeOfData';
import calculateRequiredDeposit from './calculateRequiredDeposit';

describe('calculateRequiredDeposit()', () => {
  const accountId = 'account.test.near';
  const minimumStorageCost: BigNumber = new BigNumber(
    MINIMUM_STORAGE_IN_BYTES
  ).multipliedBy(new BigNumber(STORAGE_COST_PER_BYTES_IN_ATOMIC_UNITS));

  describe('when there is no storage balance', () => {
    it('should return the minimum storage cost if storage cost of data is lower', () => {
      // arrange
      // act
      const result = calculateRequiredDeposit({
        data: {
          [accountId]: {
            profile: {
              name: randomBytes(16).toString('hex'),
            },
          },
        },
        storageBalance: null,
      });

      // assert
      expect(result.toFixed()).toBe(minimumStorageCost.toFixed());
    });

    it('should return the storage cost of data if it is higher than the minimum storage cost', () => {
      // arrange
      const data = {
        [accountId]: {
          profile: {
            name: randomBytes(parseInt(MINIMUM_STORAGE_IN_BYTES) + 1).toString(
              'hex'
            ),
          },
        },
      };
      const storageCostOfData = new BigNumber(String(calculateSizeOfData(data)))
        .plus(EXTRA_STORAGE_BALANCE)
        .multipliedBy(STORAGE_COST_PER_BYTES_IN_ATOMIC_UNITS);

      // act
      const result = calculateRequiredDeposit({
        data,
        storageBalance: null,
      });

      // assert
      expect(result.toFixed()).toBe(storageCostOfData.toFixed());
    });
  });

  describe('when there is a storage balance', () => {
    it('should use the difference if the available balance is lower than the cost of storage', () => {
      // arrange
      const data = {
        [accountId]: {
          profile: {
            name: randomBytes(128).toString('hex'),
          },
        },
      };
      const difference = new BigNumber('12');
      const storageCostOfData = new BigNumber(String(calculateSizeOfData(data)))
        .plus(EXTRA_STORAGE_BALANCE)
        .multipliedBy(STORAGE_COST_PER_BYTES_IN_ATOMIC_UNITS);

      // act
      const result = calculateRequiredDeposit({
        data,
        storageBalance: {
          available: BigInt(storageCostOfData.minus(difference).toFixed()),
          total: BigInt(storageCostOfData.minus(difference).toFixed()),
        },
      });

      // assert
      expect(result.toFixed()).toBe(difference.toFixed());
    });

    it('should use 1 if the available balance covers the cost of storage', () => {
      // arrange
      const data = {
        [accountId]: {
          profile: {
            name: randomBytes(128).toString('hex'),
          },
        },
      };
      const storageCostOfData = new BigNumber(String(calculateSizeOfData(data)))
        .plus(EXTRA_STORAGE_BALANCE)
        .multipliedBy(STORAGE_COST_PER_BYTES_IN_ATOMIC_UNITS);

      // act
      const result = calculateRequiredDeposit({
        data,
        storageBalance: {
          available: BigInt(storageCostOfData.plus('1').toFixed()),
          total: BigInt(storageCostOfData.plus('10').toFixed()),
        },
      });

      // assert
      expect(result.toFixed()).toBe('0');
    });
  });
});
