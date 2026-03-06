import { useCallback } from "react";
import { useRoute } from "@react-navigation/native";
import { trackWalletCredentialSupport } from "../analytics";
import { getMixPanelCredential } from "../../../analytics/utils/index.ts";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { StoredCredential } from "../../../common/utils/itwTypesUtils.ts";
import { FAQsCategoriesType } from "../../../../../utils/faq.ts";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
import {
  useItwZendeskSupport,
  ZendeskSubcategoryValue
} from "../../../common/hooks/useItwZendeskSupport";

/**
 *
 * @param {StoredCredential} credential A valid wallet credential
 * @param {Array<FAQsCategoriesType>} _faqCategories Unused – kept for backward-compatible API
 * @returns A utility function which tracks and starts the IT Wallet support request with the
 *          correct Zendesk metadata (category, subcategory, error code when available).
 */
export const useItwStartCredentialSupportRequest = (
  credential: StoredCredential,
  _faqCategories: Array<FAQsCategoriesType> = []
) => {
  const { startItwZendeskSupport } = useItwZendeskSupport();
  const { name: currentScreenName } = useRoute();
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);

  return useCallback(() => {
    trackWalletCredentialSupport(
      getMixPanelCredential(credential.credentialType, isItwL3)
    );

    const statusAssertion = credential.storedStatusAssertion;
    const errorCode =
      statusAssertion?.credentialStatus !== "valid"
        ? statusAssertion?.errorCode
        : undefined;

    startItwZendeskSupport({
      subcategory: ZendeskSubcategoryValue.IT_WALLET_AGGIUNTA_DOCUMENTI,
      errorCode,
      logData: errorCode,
      startingRoute: currentScreenName
    });
  }, [
    credential.credentialType,
    credential.storedStatusAssertion,
    currentScreenName,
    isItwL3,
    startItwZendeskSupport
  ]);
};
