import { useCallback } from "react";
import {
  CREDENTIALS_MAP,
  trackWalletCredentialSupport
} from "../../../analytics/index.ts";
import { useOfflineToastGuard } from "../../../../../hooks/useOfflineToastGuard.ts";
import { useStartSupportRequest } from "../../../../../hooks/useStartSupportRequest.ts";
import { StoredCredential } from "../../../common/utils/itwTypesUtils.ts";
import { FAQsCategoriesType } from "../../../../../utils/faq.ts";
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

  return useCallback(() => {
    trackWalletCredentialSupport(CREDENTIALS_MAP[credential.credentialType]);
    startSupportRequest();
  }, [credential.credentialType, startSupportRequest]);
};
