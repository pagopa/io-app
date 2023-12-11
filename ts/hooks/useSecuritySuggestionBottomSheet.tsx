import React, { useCallback, useEffect } from "react";
import {
  isFastLoginFFEnabledSelector,
  isSecurityAdviceAcknowledgedEnabled,
  isSecurityAdviceReadyToShow
} from "../features/fastLogin/store/selectors";
import I18n from "../i18n";
import { useIOSelector } from "../store/hooks";
import { progressSelector } from "../store/reducers/identification";
import { useIOBottomSheetAutoresizableModal } from "../utils/hooks/bottomSheet";
import SecuritySuggestions from "../features/fastLogin/components/SecuritySuggestions";

export const useSecuritySuggestionsBottomSheet = () => {
  const identificationProgressState = useIOSelector(progressSelector);
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
    // During the current session, we listen to the identification progress state
    // to show the security suggestion bottom sheet when the user is identified
    if (
      identificationProgressState.kind === "identified" ||
      isSecurityAdviceReadyToBeShown
    ) {
      showSecuritySuggestionModal();
    }
  }, [
    identificationProgressState,
    showSecuritySuggestionModal,
    isSecurityAdviceReadyToBeShown
  ]);

  return {
    securitySuggestionBottomSheet
  };
};
