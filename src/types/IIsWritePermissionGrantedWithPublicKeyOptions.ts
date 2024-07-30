import { utils } from 'near-api-js';

/**
 * @property {utils.PublicKey | string} granteePublicKey - the public key the account to check if it has write
 * permissions for a key.
 * @property {string} key - the key to check if the grantee has write permission.
 */
interface IIsWritePermissionGrantedWithPublicKeyOptions {
  granteePublicKey: utils.PublicKey | string;
  key: string;
}

export default IIsWritePermissionGrantedWithPublicKeyOptions;
