import React from "react";
import { MessageAttachments } from "../components/MessageAttachments";
import { useIOBottomSheetAutoresizableModal } from "../../../utils/hooks/bottomSheet";
import I18n from "../../../i18n";
import { ThirdPartyAttachment } from "../../../../definitions/backend/ThirdPartyAttachment";
import { UIMessageId } from "../../messages/types";

export const useF24BottomSheet = (
  attachments: ReadonlyArray<ThirdPartyAttachment>,
  messageId: UIMessageId,
  openPreview: (attachment: ThirdPartyAttachment) => void
) => {
  const { present, bottomSheet, dismiss } = useIOBottomSheetAutoresizableModal(
    {
      component: (
        <MessageAttachments
          testID="f24-list-container-bs"
          attachments={attachments}
          downloadAttachmentBeforePreview={true}
          messageId={messageId}
          openPreview={(attachment: ThirdPartyAttachment) => {
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
