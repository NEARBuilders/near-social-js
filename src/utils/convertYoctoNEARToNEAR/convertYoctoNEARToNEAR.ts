import { NEAR_NOMINATION_EXP } from '@app/constants';
import BigNumber from 'bignumber.js';

/**
 * Convenience function that converts a yoctoNEAR amount (atomic unit) to the NEAR amount (standard unit).
 * @param {string} atomicAmount - the yoctoNEAR amount to convert.
 * @returns {string} the NEAR amount.
 */
export default function convertYoctoNEARToNEAR(atomicAmount: string): string {
  BigNumber.config({
    ROUNDING_MODE: 0,
  });

  return new BigNumber(atomicAmount)
    .dividedBy(new BigNumber(10).pow(NEAR_NOMINATION_EXP))
    .toFixed();
}
