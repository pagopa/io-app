import * as pot from "@pagopa/ts-commons/lib/pot";
import React, { useEffect } from "react";
import { PnParamsList } from "../navigation/params";
import {
  UIMessageId,
  UIAttachmentId
} from "../../../store/reducers/entities/messages/types";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { MessageAttachmentPreview } from "../../messages/components/MessageAttachmentPreview";
import { mixpanelTrack } from "../../../mixpanel";
import { useIOSelector } from "../../../store/hooks";
import { pnMessageFromIdSelector } from "../store/reducers";

export type PnAttachmentPreviewNavigationParams = Readonly<{
  messageId: UIMessageId;
  attachmentId: UIAttachmentId;
}>;

export const PnAttachmentPreview = (
  props: IOStackNavigationRouteProps<
    PnParamsList,
    "PN_ROUTES_MESSAGE_ATTACHMENT"
  >
): React.ReactElement => {
  const navigation = props.navigation;
  const messageId = props.route.params.messageId;
  const attachmentId = props.route.params.attachmentId;
  const pnMessagePot = useIOSelector(state =>
    pnMessageFromIdSelector(state, messageId)
  );
  const attachment = pot.isSome(pnMessagePot)
    ? pnMessagePot.value?.attachments?.find(a => a.id === attachmentId)
    : undefined;

  useEffect(() => {
    // This condition happens only if this screen is shown without having
    // first retrieved the third party message (so it should never happen)
    if (!attachment) {
      navigation.goBack();
    }
  }, [attachment, navigation]);

  return attachment ? (
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
  ) : (
    <></>
  );
};
