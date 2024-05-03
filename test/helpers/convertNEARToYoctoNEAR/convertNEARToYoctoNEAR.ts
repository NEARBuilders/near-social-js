import { utils } from 'near-api-js';
import BN from 'bn.js';

/**
 * Convenience function that converts the NEAR amount (standard unit) to the yoctoNEAR amount (atomic unit).
 * @param {bigint} standardAmount - the Near amount to convert.
 * @returns {bigint} the yoctoNear amount.
 */
export default function convertNEARToYoctoNEAR(standardAmount: bigint): bigint {
  const value = new BN(String(standardAmount)).mul(
    new BN('10').pow(new BN(utils.format.NEAR_NOMINATION_EXP))
  );

  return BigInt(value.toString());
}
