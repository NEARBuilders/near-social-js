/**
 * @property {string} granteeAccountId - the account ID to check if it has write permissions for a key.
 * @property {string} key - the key to check if the grantee has write permission.
 */
interface IIsWritePermissionGrantedOptions {
  granteeAccountId: string;
  key: string;
}

export default IIsWritePermissionGrantedOptions;
