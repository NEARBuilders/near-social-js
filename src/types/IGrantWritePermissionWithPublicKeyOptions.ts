import { utils } from 'near-api-js';

// types
import type IDefaultChangeOptions from './IDefaultChangeOptions';

/**
 * @property {string} granteePublicKey - the public key of the account to give write permission to.
 * @property {string[]} keys - a list of keys to give the grantee write permission.
 */
interface IGrantWritePermissionWithAccountIdOptions
  extends IDefaultChangeOptions {
  granteePublicKey: utils.PublicKey | string;
  keys: string[];
}

export default IGrantWritePermissionWithAccountIdOptions;
