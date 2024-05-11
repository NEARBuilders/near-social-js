import BigNumber from 'bignumber.js';
import { utils } from 'near-api-js';

/**
 * Convenience function that converts a NEAR amount (standard unit) to the yoctoNEAR amount (atomic unit).
 * @param {string} standardAmount - the NEAR amount to convert.
 * @returns {string} the yoctoNEAR amount.
 */
export default function convertNEARToYoctoNEAR(standardAmount: string): string {
  BigNumber.config({
    ROUNDING_MODE: 0,
  });

  return new BigNumber(standardAmount)
    .multipliedBy(new BigNumber('10').pow(utils.format.NEAR_NOMINATION_EXP))
    .toFixed();
}
