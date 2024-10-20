// types
import { signTransaction } from '@near-js/transactions';
import { FinalExecutionOutcome, FinalExecutionStatus } from '@near-js/types';
import type { IOptions } from './types';

/**
 * Convenience function for signing and sending the transaction for a given signer.
 * @param {IOptions} options - the signer account and the transaction.
 * @returns {Promise<FinalExecutionOutcome>} a promise that resolves to the transaction outcome.
 * @throws {Error} if the transaction failed.
 */
export default async function signAndSendTransaction({
  signerAccount,
  transaction,
}: IOptions): Promise<FinalExecutionOutcome> {
  const [_, signedTransaction] = await signTransaction(
    transaction,
    signerAccount.connection.signer,
    signerAccount.accountId,
    signerAccount.connection.networkId
  );
  const result =
    await signerAccount.connection.provider.sendTransaction(signedTransaction);
  const failure = (result.status as FinalExecutionStatus)?.Failure || null;

  if (failure) {
    throw new Error(`${failure.error_type}: ${failure.error_message}`);
  }

  return result;
}
