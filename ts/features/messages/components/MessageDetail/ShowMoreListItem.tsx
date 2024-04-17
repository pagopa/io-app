import React from "react";
import { ListItemAction, ListItemInfoCopy } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { UIMessageId } from "../../types";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";

type ShowMoreListItemProps = {
  messageId: UIMessageId;
};

export const ShowMoreListItem = ({ messageId }: ShowMoreListItemProps) => {
  const { bottomSheet, present } = useIOBottomSheetAutoresizableModal(
    {
      component: (
        <ListItemInfoCopy
          value={messageId}
          label={I18n.t("messageDetails.showMoreDataBottomSheet.messageId")}
          accessibilityLabel={I18n.t(
            "messageDetails.showMoreDataBottomSheet.messageIdAccessibility"
          )}
          onPress={() => clipboardSetStringWithFeedback(messageId)}
        />
      ),
      title: I18n.t("messageDetails.showMoreDataBottomSheet.title")
    },
    100
  );

  return (
    <>
      <ListItemAction
        accessibilityLabel={I18n.t("messageDetails.footer.showMoreData")}
        icon="terms"
        label={I18n.t("messageDetails.footer.showMoreData")}
        onPress={present}
        testID="show-more-data-action"
        variant="primary"
      />
      {bottomSheet}
    </>
  );
};
