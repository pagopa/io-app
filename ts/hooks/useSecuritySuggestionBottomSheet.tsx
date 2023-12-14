import React, { useCallback, useEffect } from "react";
import {
  isFastLoginFFEnabledSelector,
  isSecurityAdviceAcknowledgedEnabled,
  isSecurityAdviceReadyToShow
} from "../features/fastLogin/store/selectors";
import I18n from "../i18n";
import { useIOSelector } from "../store/hooks";
import { useIOBottomSheetAutoresizableModal } from "../utils/hooks/bottomSheet";
import SecuritySuggestions from "../features/fastLogin/components/SecuritySuggestions";

/**
 * @param useManualBottomsheetOpening if true the caller must use the methods exported by
 * useIOBottomSheetAutoresizableModal whitout automation on bottomsheet opening.
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
  } = useIOBottomSheetAutoresizableModal({
    title: I18n.t("authentication.opt_in.security_suggests"),
    component: <SecuritySuggestions />,
    fullScreen: true
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
