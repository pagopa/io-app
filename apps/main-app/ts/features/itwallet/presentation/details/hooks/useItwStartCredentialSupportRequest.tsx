import { useCallback } from "react";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { getMixPanelCredential } from "../../../analytics/utils/index.ts";
import {
  useItwZendeskSupport,
  ZendeskSubcategoryValue
} from "../../../common/hooks/useItwZendeskSupport";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils.ts";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
import { trackWalletCredentialSupport } from "../analytics";

/**
 *
 * @param {CredentialMetadata} credential A valid wallet credential
 * @returns A utility function which tracks and starts the IT Wallet support request with the
 *          correct Zendesk metadata (category, subcategory, error code when available).
 */
export const useItwStartCredentialSupportRequest = (
  credential: CredentialMetadata
) => {
  const { startItwZendeskSupport } = useItwZendeskSupport();
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);

  const getErrorCode = () => {
    if (!credential.validity) {
      return undefined;
    }

    if (
      credential.validity.type === "status_assertion" &&
      credential.validity.status === "invalid"
    ) {
      return credential.validity.errorCode;
    }

    return credential.validity.status;
  };

  const errorCode = getErrorCode();

  return useCallback(() => {
    trackWalletCredentialSupport(
      getMixPanelCredential(credential.credentialType, isItwL3)
    );

    startItwZendeskSupport({
      subcategory: ZendeskSubcategoryValue.IT_WALLET_AGGIUNTA_DOCUMENTI,
      errorCode,
      logData: errorCode
    });
  }, [credential.credentialType, errorCode, isItwL3, startItwZendeskSupport]);
};
