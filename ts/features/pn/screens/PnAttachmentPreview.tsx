import React from "react";
import { PnParamsList } from "../navigation/params";
import {
  UIMessageId,
  UIAttachment
} from "../../../store/reducers/entities/messages/types";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { MessageAttachmentPreview } from "../../messages/components/MessageAttachmentPreview";
import { mixpanelTrack } from "../../../mixpanel";

export type PnAttachmentPreviewNavigationParams = Readonly<{
  messageId: UIMessageId;
  attachment: UIAttachment;
}>;

export const PnAttachmentPreview = (
  props: IOStackNavigationRouteProps<
    PnParamsList,
    "PN_ROUTES_MESSAGE_ATTACHMENT"
  >
): React.ReactElement => {
  const messageId = props.route.params.messageId;
  const attachment = props.route.params.attachment;

  return (
    <MessageAttachmentPreview
      messageId={messageId}
      attachment={attachment}
      onPDFError={() => {
        void mixpanelTrack("PN_ATTACHMENT_PREVIEW_STATUS", {
          previewStatus: "error"
        });
      }}
      onLoadComplete={() => {
        void mixpanelTrack("PN_ATTACHMENT_PREVIEW_STATUS", {
          previewStatus: "displayed"
        });
      }}
      onShare={() => {
        void mixpanelTrack("PN_ATTACHMENT_SHARE");
      }}
      onOpen={() => {
        void mixpanelTrack("PN_ATTACHMENT_OPEN");
      }}
      onDownload={() => {
        void mixpanelTrack("PN_ATTACHMENT_SAVE");
      }}
    />
  );
};
