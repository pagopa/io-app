import { IoWallet, ItwVersion } from "@pagopa/io-react-native-wallet";

/**
 * This object contains all IoWallet instances that have been created, one per
 * specs version. It works as a registry of singleton instances, that are lazily
 * created once and then reused.
 *
 * To access one of the instances it is required to use {@link getIoWallet} or
 * {@link useIoWallet}.
 */
const instances: {
  [V in ItwVersion]?: IoWallet;
} = {};

/**
 * Convenience function to get the {@link IoWallet} instance matching the
 * provided IT-Wallet specs version.
 *
 * @example
 *   const ioWallet = getIoWallet("1.3.3");
 *
 * @param version IT-Wallet version
 * @returns IoWallet instance
 */
export function getIoWallet(version: ItwVersion) {
  // Lazy initialization
  if (!instances[version]) {
    // eslint-disable-next-line functional/immutable-data
    instances[version] = new IoWallet({ version });
  }
  return instances[version];
}
