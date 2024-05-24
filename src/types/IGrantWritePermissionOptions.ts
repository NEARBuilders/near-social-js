// types
import type IDefaultChangeOptions from './IDefaultChangeOptions';

/**
 * @property {string} granteeAccountId - the account ID to give write permission to.
 * @property {string[]} keys - a list of keys to give the grantee write permission.
 */
interface IGrantWritePermissionOptions extends IDefaultChangeOptions {
  granteeAccountId: string;
  keys: string[];
}

export default IGrantWritePermissionOptions;
