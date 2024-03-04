import React from "react";
import { ListItemInfoCopy } from "@pagopa/io-app-design-system";
import { useIOBottomSheetAutoresizableModal } from "../../../utils/hooks/bottomSheet";
import I18n from "../../../i18n";
import { UIMessageId } from "../types";
import { clipboardSetStringWithFeedback } from "../../../utils/clipboard";

export const useMessageMoreDataBottomSheet = (messageId: UIMessageId) => {
  const { present, bottomSheet } = useIOBottomSheetAutoresizableModal(
    {
      component: (
        <ListItemInfoCopy
          value={messageId}
          label={I18n.t("messageDetails.showMoreDataBottomSheet.messageId")}
          accessibilityLabel={I18n.t(
            "messageDetails.showMoreDataBottomSheet.messageId"
          )}
          onPress={() => clipboardSetStringWithFeedback(messageId)}
        />
      ),
      title: I18n.t("messageDetails.showMoreDataBottomSheet.title")
    },
    100
  );

  return {
    present,
    bottomSheet
  };
};
