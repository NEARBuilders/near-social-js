// types
import type IDefaultViewOptions from './IDefaultViewOptions';

/**
 * @property {string} granteeAccountId - the account ID to check if it has write permissions for a key.
 * @property {string} key - the key to check if the grantee has write permission.
 */
interface IIsWritePermissionGrantedOptions extends IDefaultViewOptions {
  granteeAccountId: string;
  key: string;
}

export default IIsWritePermissionGrantedOptions;
