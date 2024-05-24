import { providers, transactions } from 'near-api-js';

// types
import type { IOptions } from './types';

/**
 * Convenience function for signing and sending the transaction for a given signer.
 * @param {IOptions} options - the signer account and the transaction.
 * @returns {Promise<providers.FinalExecutionOutcome>} a promise that resolves to the transaction outcome.
 * @throws {Error} if the transaction failed.
 */
export default async function signAndSendTransaction({
  signerAccount,
  transaction,
}: IOptions): Promise<providers.FinalExecutionOutcome> {
  const [_, signedTransaction] = await transactions.signTransaction(
    transaction,
    signerAccount.connection.signer,
    signerAccount.accountId,
    signerAccount.connection.networkId
  );
  const result =
    await signerAccount.connection.provider.sendTransaction(signedTransaction);
  const failure =
    (result.status as providers.FinalExecutionStatus)?.Failure || null;

  if (failure) {
    throw new Error(`${failure.error_type}: ${failure.error_message}`);
  }

  return result;
}
