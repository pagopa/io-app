import { useEffect } from "react";
import { useIOToast } from "@pagopa/io-app-design-system";
import { useIOSelector } from "../../../../store/hooks";
import {
  archiveMessagesErrorReasonSelector,
  inboxMessagesErrorReasonSelector,
  latestMessageOperationToastTypeSelector,
  latestMessageOperationTranslationKeySelector
} from "../../store/reducers/allPaginated";
import I18n from "../../../../i18n";

export const Toasts = () => {
  const toast = useIOToast();

  // Handling of archiving/unarchiving operations result
  const latestMessageOperationToastType = useIOSelector(
    latestMessageOperationToastTypeSelector
  );
  const latestMessageOperationTranslationKey = useIOSelector(
    latestMessageOperationTranslationKeySelector
  );
  useEffect(() => {
    if (
      latestMessageOperationToastType &&
      latestMessageOperationTranslationKey
    ) {
      const translationKey = I18n.t(latestMessageOperationTranslationKey);
      switch (latestMessageOperationToastType) {
        case "error":
          toast.error(translationKey);
          break;
        case "success":
          toast.success(translationKey);
          break;
      }
    }
  }, [
    latestMessageOperationToastType,
    latestMessageOperationTranslationKey,
    toast
  ]);

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
