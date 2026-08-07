import { useIOSelector } from "../../../../store/hooks";
import { selectItwSpecsVersion } from "../store/selectors/environment";
import { getIoWallet } from "../utils/itwIoWallet";

/**
 * Convenience hook to get the {@link IoWallet} instance matching the current
 * IT-Wallet specs version.
 *
 * @example
 *   const ioWallet = useIoWallet();
 *
 * @returns IoWallet instance
 */
export const useIoWallet = () => {
  const itwSpecsVersion = useIOSelector(selectItwSpecsVersion);
  return getIoWallet(itwSpecsVersion);
};
