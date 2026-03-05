import { IoWallet, ItwVersion } from "@pagopa/io-react-native-wallet";
import { useIOSelector } from "../../../../store/hooks";
import { selectItwSpecsVersion } from "../store/selectors/environment";

const instances: {
  [V in ItwVersion]?: IoWallet;
} = {};

/**
 * Convenience hook to get the {@link IoWallet} instance matching the current IT-Wallet specs version.
 * @returns IoWallet
 */
export const useIoWallet = () => {
  const itwSpecsVersion = useIOSelector(selectItwSpecsVersion);
  return getIoWallet(itwSpecsVersion);
};

/**
 * Convenience function to get the {@link IoWallet} instance matching the provided IT-Wallet specs version.
 * @param version IT-Wallet version
 * @returns IoWallet
 */
export function getIoWallet(version: ItwVersion) {
  // Lazy initialization
  if (!instances[version]) {
    // eslint-disable-next-line functional/immutable-data
    instances[version] = new IoWallet({ version });
  }
  return instances[version];
}
