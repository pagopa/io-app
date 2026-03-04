import { IoWallet, ItwVersion } from "@pagopa/io-react-native-wallet";
import { useIOSelector } from "../../../../store/hooks";
import { selectItwSpecsVersion } from "../store/selectors/environment";

const ioWalletMap: Record<ItwVersion, IoWallet> = {
  "1.0.0": new IoWallet({ version: "1.0.0" }),
  "1.3.3": new IoWallet({ version: "1.3.3" })
};

/**
 * Convenience hook to get the IoWallet instance matching the current IT-Wallet specs version.
 * @returns IoWallet
 */
export const useIoWallet = () => {
  const itwSpecsVersion = useIOSelector(selectItwSpecsVersion);
  return ioWalletMap[itwSpecsVersion];
};

/**
 * Convenience function to get the IoWallet instance matching the provided IT-Wallet specs version.
 * @param version IT-Wallet version
 * @returns IoWallet
 */
export function getIoWallet(version: ItwVersion) {
  return ioWalletMap[version];
}
