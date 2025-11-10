import { useLinkTo } from "@react-navigation/native";
import { useIODispatch } from "../store/hooks";
import { externalWalletUpdate } from "../features/wallet/store/actions";
import { handleInternalLink } from "../utils/internalLink";
import { shouldTriggerWalletUpdate } from "../utils/deepLinkUtils";

/**
 * This hook handles deep links. It removes the prefix and navigates to the path using the linkTo function
 * @returns a function that takes a url and navigates to the path
 */
export const useOpenDeepLink = () => {
  const linkTo = useLinkTo();
  const dispatch = useIODispatch();

  return (url: string) => {
    // Trigger wallet update for external Universal Links and specific internal paths
    if (shouldTriggerWalletUpdate(url)) {
      dispatch(externalWalletUpdate());
    }

    handleInternalLink(linkTo, url);
  };
};
