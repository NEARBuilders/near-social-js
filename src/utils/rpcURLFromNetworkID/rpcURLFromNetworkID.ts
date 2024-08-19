// constants
import { networkRPCs } from '@app/constants';

// enums
import { NetworkIDEnum } from '@app/enums';

/**
 * Convenience function that gets the RPC URL for a given network ID. If the network ID is unknown, null is returned.
 * @param {string} networkID - a network ID. Should be one of betanet, localnet, mainnet or testnet.
 * @returns {string | null} the RPC URL for a given network ID, or null if the network ID is unknown.
 */
export default function rpcURLFromNetworkID(networkID: string): string | null {
  switch (networkID) {
    case NetworkIDEnum.Betanet:
      return networkRPCs.betanet;
    case NetworkIDEnum.Localnet:
      return networkRPCs.localnet;
    case NetworkIDEnum.Mainnet:
      return networkRPCs.mainnet;
    case NetworkIDEnum.Testnet:
      return networkRPCs.testnet;
    default:
      return null;
  }
}
