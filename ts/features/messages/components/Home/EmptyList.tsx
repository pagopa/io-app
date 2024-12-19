import { useCallback, useMemo } from "react";
import { constUndefined, pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import { ButtonSolidProps, IOPictograms } from "@pagopa/io-app-design-system";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
import { emptyListReasonSelector } from "../../store/reducers/allPaginated";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { reloadAllMessages } from "../../store/actions";
import { pageSize } from "../../../../config";
import { MessageListCategory } from "../../types/messageListCategory";
import { isArchivingInProcessingModeSelector } from "../../store/reducers/archiving";

export type EmptyListProps = {
  category: MessageListCategory;
};

type ScreenDataType = {
  action?: Pick<
    ButtonSolidProps,
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
