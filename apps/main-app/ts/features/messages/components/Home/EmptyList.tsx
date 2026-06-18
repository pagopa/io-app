import { IOPictograms } from "@pagopa/io-app-design-system";
import * as B from "fp-ts/lib/boolean";
import { constUndefined, pipe } from "fp-ts/lib/function";
import { useCallback, useMemo } from "react";

import I18n from "i18next";
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
    "label" | "accessibilityLabel" | "onPress" | "testID"
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
  const onRetryCallback = useCallback(
    () =>
      pipe(
        store.getState(),
        isArchivingInProcessingModeSelector,
        B.fold(
          () =>
            pipe(
              {
                pageSize,
                filter: { getArchived: category === "ARCHIVE" },
                fromUserAction: true
              },
              reloadAllMessages.request,
              dispatch
            ),
          constUndefined
        )
      ),
    [category, dispatch, store]
  );

  const screenData = useMemo((): ScreenDataType | undefined => {
    switch (emptyListReason) {
      case "noData":
        const categoryKey = category === "ARCHIVE" ? "archive" : "inbox";
        return {
          pictogram: "empty",
          subtitle: I18n.t(`messages.${categoryKey}.emptyMessage.subtitle`),
          title: I18n.t(`messages.${categoryKey}.emptyMessage.title`)
        };
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
