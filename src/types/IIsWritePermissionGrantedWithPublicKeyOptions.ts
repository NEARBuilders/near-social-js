import { PublicKey } from '@near-js/crypto';

/**
 * @property {PublicKey | string} granteePublicKey - the public key the account to check if it has write
 * permissions for a key.
 * @property {string} key - the key to check if the grantee has write permission.
 */
interface IIsWritePermissionGrantedWithPublicKeyOptions {
  granteePublicKey: PublicKey | string;
  key: string;
}

export default IIsWritePermissionGrantedWithPublicKeyOptions;
