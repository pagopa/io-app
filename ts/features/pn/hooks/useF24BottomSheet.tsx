import React from "react";
import { MessageAttachments } from "../../messages/components/MessageAttachments";
import { UIAttachment } from "../../../store/reducers/entities/messages/types";
import { useIOBottomSheetAutoresizableModal } from "../../../utils/hooks/bottomSheet";
import I18n from "../../../i18n";

export const useF24BottomSheet = (attachments: ReadonlyArray<UIAttachment>) => {
  const { present, bottomSheet, dismiss } = useIOBottomSheetAutoresizableModal({
    component: (
      <MessageAttachments
        testID="f24-list-container-bs"
        attachments={attachments}
        downloadAttachmentBeforePreview={true}
        // TODO: navigate to preview
        // https://pagopa.atlassian.net/browse/IOCOM-457
        openPreview={() => {
          dismiss();
        }}
      />
    ),
    title: I18n.t("features.pn.details.f24Section.bottomSheet.title")
  });

  return {
    present,
    bottomSheet
  };
};
