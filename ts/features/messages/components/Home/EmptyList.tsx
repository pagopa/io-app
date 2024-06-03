import React, { useMemo } from "react";
import { ButtonSolidProps, IOPictograms } from "@pagopa/io-app-design-system";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { emptyListReasonSelector } from "../../store/reducers/allPaginated";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { reloadAllMessages } from "../../store/actions";
import { pageSize } from "../../../../config";
import { MessageListCategory } from "../../types/messageListCategory";

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
  const emptyListReason = useIOSelector(state =>
    emptyListReasonSelector(state, category)
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
            label: I18n.t("global.buttons.retry"),
            onPress: () =>
              dispatch(
                reloadAllMessages.request({
                  pageSize,
                  filter: { getArchived: category === "ARCHIVE" }
                })
              )
          },
          pictogram: "fatalError",
          title: I18n.t("messages.loadingErrorTitle")
        };
      default:
        return undefined;
    }
  }, [category, dispatch, emptyListReason]);

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
