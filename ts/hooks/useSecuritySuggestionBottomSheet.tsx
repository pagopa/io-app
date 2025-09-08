import { useCallback, useEffect } from "react";
import I18n from "i18next";
import {
  isFastLoginFFEnabledSelector,
  isSecurityAdviceAcknowledgedEnabled,
  isSecurityAdviceReadyToShow
} from "../features/authentication/fastLogin/store/selectors";
import { useIOSelector } from "../store/hooks";
import { useIOBottomSheetModal } from "../utils/hooks/bottomSheet";
import SecuritySuggestions from "../features/authentication/fastLogin/components/SecuritySuggestions";

/**
 * @param useManualBottomsheetOpening if true the caller must use the methods exported by
 * useIOBottomSheetModal whitout automation on bottomsheet opening.
 */

export const useSecuritySuggestionsBottomSheet = (
  useManualBottomsheetOpening: boolean = true
) => {
  const isFastLoginFFEnabled = useIOSelector(isFastLoginFFEnabledSelector);
  const securityAdviceAcknowledged = useIOSelector(
    isSecurityAdviceAcknowledgedEnabled
  );
  const isSecurityAdviceReadyToBeShown = useIOSelector(
    isSecurityAdviceReadyToShow
  );

  const {
    present: presentSecuritySuggestionBottomSheet,
    bottomSheet: securitySuggestionBottomSheet
  } = useIOBottomSheetModal({
    title: I18n.t("authentication.opt_in.security_suggests"),
    component: <SecuritySuggestions />
  });

  const showSecuritySuggestionModal = useCallback(() => {
    if (!securityAdviceAcknowledged && isFastLoginFFEnabled) {
      presentSecuritySuggestionBottomSheet();
    }
  }, [
    isFastLoginFFEnabled,
    presentSecuritySuggestionBottomSheet,
    securityAdviceAcknowledged
  ]);

  useEffect(() => {
    // During the actual session, we listen to the identification progress state
    // to show the security suggestion bottom sheet when the user is identified.
    // During the onboarding or the first onboarding we wait for isSecurityAdviceReadyToBeShown
    // before showing the bottom sheet.

    // eslint-disable-next-line sonarjs/no-collapsible-if
    if (!useManualBottomsheetOpening) {
      if (isSecurityAdviceReadyToBeShown) {
        showSecuritySuggestionModal();
      }
    }
  }, [
    showSecuritySuggestionModal,
    isSecurityAdviceReadyToBeShown,
    useManualBottomsheetOpening
  ]);

  return {
    securitySuggestionBottomSheet,
    presentSecuritySuggestionBottomSheet
  };
};
