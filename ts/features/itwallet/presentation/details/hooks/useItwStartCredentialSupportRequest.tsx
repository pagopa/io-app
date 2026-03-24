import { useCallback } from "react";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { getMixPanelCredential } from "../../../analytics/utils/index.ts";
import {
  useItwZendeskSupport,
  ZendeskSubcategoryValue
} from "../../../common/hooks/useItwZendeskSupport";
import { StoredCredential } from "../../../common/utils/itwTypesUtils.ts";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
import { trackWalletCredentialSupport } from "../analytics";

/**
 *
 * @param {StoredCredential} credential A valid wallet credential
 * @returns A utility function which tracks and starts the IT Wallet support request with the
 *          correct Zendesk metadata (category, subcategory, error code when available).
 */
export const useItwStartCredentialSupportRequest = (
  credential: StoredCredential
) => {
  const { startItwZendeskSupport } = useItwZendeskSupport();
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
      logData: errorCode
    });
  }, [
    credential.credentialType,
    credential.storedStatusAssertion,
    isItwL3,
    startItwZendeskSupport
  ]);
};
