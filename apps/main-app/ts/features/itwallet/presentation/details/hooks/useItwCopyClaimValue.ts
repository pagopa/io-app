import { useIOSelector } from "../../../../../store/hooks";
import { clipboardSetStringWithFeedback } from "../../../../../utils/clipboard";
import { trackCopyListItem } from "../../../analytics";
import { getMixPanelCredential } from "../../../analytics/utils";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";

/**
 * Returns a handler that copies a claim value to the clipboard and tracks the
 * copy action on Mixpanel.
 *
 * @param credentialType The credential type the claims belong to, used for
 *   analytics tracking
 * @returns A function that copies the given claim value
 */
export const useItwCopyClaimValue = (credentialType: string) => {
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);

  return (label: string, value: string) => {
    clipboardSetStringWithFeedback(value);
    trackCopyListItem({
      credential: getMixPanelCredential(credentialType, isItwL3),
      item_copied: label
    });
  };
};
