// constants
import { ESTIMATED_KEY_VALUE_SIZE, ESTIMATED_NODE_SIZE } from './constants';

// utils
import isObject from '../isObject';

/**
 * Calculates the size of some data.
 * @param {Record<string, unknown> | string} data - the data.
 * @returns {BigNumber} the size of the data.
 * @see {@link https://github.com/NearSocial/VM/blob/6047c6a9b96f3de14e600c1d2b96c432bbb76dd4/src/lib/data/utils.js#L193}
 */
export default function calculateSizeOfData(
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
            return (
              acc +
              calculate({
                data: value,
                previousData: (previousData as Record<string, unknown>)[key],
              })
            );
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
