import { useCallback } from "react";
import {
  getMixPanelCredential,
  trackWalletCredentialSupport
} from "../../../analytics";
import { useOfflineToastGuard } from "../../../../../hooks/useOfflineToastGuard.ts";
import { useStartSupportRequest } from "../../../../../hooks/useStartSupportRequest.ts";
import { StoredCredential } from "../../../common/utils/itwTypesUtils.ts";
import { FAQsCategoriesType } from "../../../../../utils/faq.ts";
import { useIOSelector } from "../../../../../store/hooks";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
/**
 *
 * @param {StoredCredential} credential A valid wallet credential
 * @param {Array<FAQsCategoriesType>} faqCategories An array of FAQ categories (defaults to [])
 * @returns A utility function which tracks and starts the support request
 */
export const useItwStartCredentialSupportRequest = (
  credential: StoredCredential,
  faqCategories: Array<FAQsCategoriesType> = []
) => {
  const startSupportRequest = useOfflineToastGuard(
    useStartSupportRequest({
      faqCategories
    })
  );
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);

  return useCallback(() => {
    trackWalletCredentialSupport(
      getMixPanelCredential(credential.credentialType, isItwL3)
    );
    startSupportRequest();
  }, [credential.credentialType, startSupportRequest, isItwL3]);
};
