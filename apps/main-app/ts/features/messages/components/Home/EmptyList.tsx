import { IOPictograms } from "@io-app/design-system";
import I18n from "i18next";
import { useCallback, useMemo } from "react";

import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { ButtonBlockProps } from "../../../../components/ui/utils/buttons";
import { pageSize } from "../../../../config";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
import { reloadAllMessages } from "../../store/actions";
import { emptyListReasonSelector } from "../../store/reducers/allPaginated";
import { isArchivingInProcessingModeSelector } from "../../store/reducers/archiving";
import { MessageListCategory } from "../../types/messageListCategory";

export type EmptyListProps = {
  category: MessageListCategory;
};

type ScreenDataType = {
  action?: Pick<
    ButtonBlockProps,
    "accessibilityLabel" | "label" | "onPress" | "testID"
  >;
  pictogram: IOPictograms;
  subtitle?: string;
  title: string;
};

export const EmptyList = ({ category }: EmptyListProps) => {
  const dispatch = useIODispatch();
  const store = useIOStore();

  const emptyListReason = useIOSelector(state =>
    emptyListReasonSelector(state, category)
  );
  const onRetryCallback = useCallback(() => {
    if (isArchivingInProcessingModeSelector(store.getState())) {
      return;
    }
    dispatch(
      reloadAllMessages.request({
        pageSize,
        filter: { getArchived: category === "ARCHIVE" },
        fromUserAction: true
      })
    );
  }, [category, dispatch, store]);

  const screenData = useMemo((): ScreenDataType | undefined => {
    switch (emptyListReason) {
      case "error":
        return {
          action: {
            testID: "home_emptyList_retry",
            label: I18n.t("global.buttons.retry"),
            onPress: onRetryCallback
          },
          pictogram: "fatalError",
          title: I18n.t("messages.loadingErrorTitle")
        };
      case "noData":
        const isArchive = category === "ARCHIVE";
        return {
          pictogram: "empty",
          subtitle: isArchive
            ? I18n.t("messages.archive.emptyMessage.subtitle")
            : I18n.t("messages.inbox.emptyMessage.subtitle"),
          title: isArchive
            ? I18n.t("messages.archive.emptyMessage.title")
            : I18n.t("messages.inbox.emptyMessage.title")
        };
      default:
        return undefined;
    }
  }, [category, emptyListReason, onRetryCallback]);

  if (!screenData) {
    return null;
  }

  return (
    <OperationResultScreenContent
      action={screenData.action}
      isHeaderVisible
      pictogram={screenData.pictogram}
      subtitle={screenData.subtitle}
      title={screenData.title}
    />
  );
};
