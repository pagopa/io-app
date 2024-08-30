import { useEffect } from "react";
import { useIOToast } from "@pagopa/io-app-design-system";
import { useIOSelector } from "../../../../store/hooks";
import {
  archiveMessagesErrorReasonSelector,
  inboxMessagesErrorReasonSelector
} from "../../store/reducers/allPaginated";
import I18n from "../../../../i18n";
import {
  processingResultReasonSelector,
  processingResultTypeSelector
} from "../../store/reducers/archiving";

export const Toasts = () => {
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
        case "warning":
          toast.warning(processingResultReason);
          break;
      }
    }
  }, [processingResultType, processingResultReason, toast]);

  // Handling of inbox messages errors. Be aware that any error
  // that happens when the list is empty is not displayed with
  // a Toast but with the EmptyList component
  const inboxErrorMessage = useIOSelector(inboxMessagesErrorReasonSelector);
  useEffect(() => {
    if (inboxErrorMessage) {
      toast.error(I18n.t("global.genericError"));
    }
  }, [inboxErrorMessage, toast]);

  // Handling of archive messages errors. Be aware that any
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
