import { IoWallet, ItwVersion } from "@pagopa/io-react-native-wallet";
import { useIOSelector } from "../../../../store/hooks";
import { selectItwSpecsVersion } from "../store/selectors/environment";

class IoWalletManager {
  private instances: {
    [V in ItwVersion]?: IoWallet;
  } = {};

  get(version: ItwVersion) {
    // Lazy initialization
    if (!this.instances[version]) {
      // eslint-disable-next-line functional/immutable-data
      this.instances[version] = new IoWallet({ version });
    }
    return this.instances[version];
  }
}

export const ioWalletManager = new IoWalletManager();

/**
 * Convenience hook to get the IoWallet instance matching the current IT-Wallet specs version.
 * @returns IoWallet
 */
export const useIoWallet = () => {
  const itwSpecsVersion = useIOSelector(selectItwSpecsVersion);
  return ioWalletManager.get(itwSpecsVersion);
};
