import { connect, accountCreator, keyStores, Near } from 'near-api-js';

// types
import type { IOptions } from './types';

/**
 * Convenience function to create a connection to the Near network.
 * @param {IOptions} options - customizes the connection.
 * @returns {Promise<Near>} a promise that resolves to an initialized Near connection.
 */
export default async function createNearConnection({
  credentialsDir,
}: IOptions): Promise<Near> {
  return await connect({
    networkId: 'localnet',
    nodeUrl: 'http://localhost:3030',
    walletUrl: 'http://localhost:4000/wallet',
    keyStore: new keyStores.UnencryptedFileSystemKeyStore(credentialsDir), // create a key store
  });
}
