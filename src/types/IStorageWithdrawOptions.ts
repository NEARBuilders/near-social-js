// types
import type IDefaultChangeOptions from './IDefaultChangeOptions';

interface IStorageWithdrawOptions extends IDefaultChangeOptions {
  amount?: string;
}

export default IStorageWithdrawOptions;

// #[payable]
//     fn storage_withdraw(&mut self, amount: Option<U128>) -> StorageBalance {
//         self.assert_live();
//         assert_one_yocto();
//         let account_id = env::predecessor_account_id();
//         self.internal_storage_withdraw(&account_id, amount)
//     }
