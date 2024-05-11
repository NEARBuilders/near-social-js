import BigNumber from 'bignumber.js';
import { utils } from 'near-api-js';

/**
 * Convenience function that converts a yoctoNEAR amount (atomic unit) to the NEAR amount (standard unit).
 * @param {string} atomicAmount - the yoctoNEAR amount to convert.
 * @returns {string} the NEAR amount.
 */
export default function convertYoctoNEARToNEAR(atomicAmount: string): string {
  return new BigNumber(atomicAmount)
    .dividedBy(new BigNumber(10).pow(utils.format.NEAR_NOMINATION_EXP))
    .toFixed();
}
