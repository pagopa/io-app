import {
  WalletInstanceAttestation as _legacy_WalletInstanceAttestation,
  Credential as _legacy_Credential
} from "@pagopa/io-react-native-wallet";
import {
  WalletInstanceAttestation,
  Credential
} from "@pagopa/io-react-native-wallet-v2";

/**
 * Proxy class that handles multiple versions of `@pagopa/io-react-native-wallet`.
 * This class should only be used in the transition phase between technical specifications 0.7.1 and 1.0.
 *
 * TODO: [SIW-2530] Remove it after transitioning and after ensuring the new Issuer APIs are backward compatible.
 */
export class IoReactNativeWalletProxy {
  WalletInstanceAttestation(newApiEnabled: boolean) {
    return newApiEnabled
      ? WalletInstanceAttestation
      : _legacy_WalletInstanceAttestation;
  }

  Credential(newApiEnabled: boolean) {
    return newApiEnabled ? Credential : _legacy_Credential;
  }
}

export const ioRNWProxy = new IoReactNativeWalletProxy();
