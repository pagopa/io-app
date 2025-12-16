import { useEffect } from "react";
import { AccessibilityInfo } from "react-native";
import { useIOToast } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIOSelector, useIOStore } from "../../../../store/hooks";
import {
  archiveMessagesErrorReasonSelector,
  inboxMessagesErrorReasonSelector
} from "../../store/reducers/allPaginated";
import {
  processingResultReasonSelector,
  processingResultTypeSelector
} from "../../store/reducers/archiving";
import { isScreenReaderEnabledSelector } from "../../../../store/reducers/preferences";

export const Toasts = () => {
  const store = useIOStore();
  const toast = useIOToast();

  // Handling of archiving/unarchiving operations result
  const processingResultType = useIOSelector(processingResultTypeSelector);
  const processingResultReason = useIOSelector(processingResultReasonSelector);
  useEffect(() => {
    if (processingResultType && processingResultReason) {
      switch (processingResultType) {
        case "error":
          toast.error(processingResultReason);
          break;
        case "success":
          toast.success(processingResultReason);
          break;
      }

      const isScreenReaderEnabled = isScreenReaderEnabledSelector(
        store.getState()
      );
      if (isScreenReaderEnabled) {
        AccessibilityInfo.announceForAccessibility(processingResultReason);
      }
    }
  }, [processingResultType, processingResultReason, store, toast]);

  // Handling of inbox messages errors. Be aware that any error
  // that happens when the list is empty is not displayed with
  // a Toast but with the EmptyList component
  const inboxErrorMessage = useIOSelector(inboxMessagesErrorReasonSelector);
  useEffect(() => {
    if (inboxErrorMessage) {
      toast.error(I18n.t("global.genericError"));
    }
  }, [inboxErrorMessage, toast]);

  // Handling of archived messages errors. Be aware that any
  // error that happens when the list is empty is not displayed
  // with a Toast but with the EmptyList component
  const archiveErrorMessage = useIOSelector(archiveMessagesErrorReasonSelector);
  useEffect(() => {
    if (archiveErrorMessage) {
      toast.error(I18n.t("global.genericError"));
    }
  }, [archiveErrorMessage, toast]);

  return null;
};
