import React from "react";
import { MessageAttachments } from "../../messages/components/MessageAttachments";
import { UIAttachment } from "../../messages/types";
import { useIOBottomSheetAutoresizableModal } from "../../../utils/hooks/bottomSheet";
import I18n from "../../../i18n";

export const useF24BottomSheet = (
  attachments: ReadonlyArray<UIAttachment>,
  openPreview: (attachment: UIAttachment) => void
) => {
  const { present, bottomSheet, dismiss } = useIOBottomSheetAutoresizableModal(
    {
      component: (
        <MessageAttachments
          testID="f24-list-container-bs"
          attachments={attachments}
          downloadAttachmentBeforePreview={true}
          openPreview={(attachment: UIAttachment) => {
            dismiss();
            openPreview(attachment);
          }}
        />
      ),
      title: I18n.t("features.pn.details.f24Section.bottomSheet.title")
    },
    100
  );

  return {
    present,
    bottomSheet
  };
};
