import React, { useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import I18n from "../../i18n";
import {
  UIAttachmentId,
  UIMessageId
} from "../../store/reducers/entities/messages/types";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { MessageAttachmentPreview } from "../../features/messages/components/MessageAttachmentPreview";
import { MessagesParamsList } from "../../navigation/params/MessagesParamsList";
import { showToast } from "../../utils/showToast";
import { getServiceByMessageId } from "../../store/reducers/entities/messages/paginatedById";
import { useIOSelector } from "../../store/hooks";
import {
  trackThirdPartyMessageAttachmentCorruptedFile,
  trackThirdPartyMessageAttachmentPreviewSuccess,
  trackThirdPartyMessageAttachmentUserAction
} from "../../utils/analytics";
import { thirdPartyMessageUIAttachment } from "../../store/reducers/entities/messages/thirdPartyById";

export type MessageDetailAttachmentNavigationParams = Readonly<{
  messageId: UIMessageId;
  attachmentId: UIAttachmentId;
}>;

export const MessageDetailAttachment = (
  props: IOStackNavigationRouteProps<
    MessagesParamsList,
    "MESSAGE_DETAIL_ATTACHMENT"
  >
): React.ReactElement => {
  const navigation = useNavigation();
  const messageId = props.route.params.messageId;
  const attachmentId = props.route.params.attachmentId;
  // This ref is needed otherwise the auto back on the useEffect will fire multiple
  // times, since its dependencies change during the back navigation
  const autoBackOnErrorHandled = useRef(false);
  const serviceId = useIOSelector(state =>
    getServiceByMessageId(state, messageId)
  );

  const thirdPartyMessageUIAttachmentOption = useIOSelector(state =>
    thirdPartyMessageUIAttachment(state)(messageId)(attachmentId)
  );

  useEffect(() => {
    // This condition happens only if this screen is shown without having
    // first retrieved the third party message (so it should never happen)
    if (
      !autoBackOnErrorHandled.current &&
      O.isNone(thirdPartyMessageUIAttachmentOption)
    ) {
      // eslint-disable-next-line functional/immutable-data
      autoBackOnErrorHandled.current = true;
      showToast(I18n.t("messageDetails.attachments.downloadFailed"));
      navigation.goBack();
    }
  }, [navigation, thirdPartyMessageUIAttachmentOption]);

  return O.isSome(thirdPartyMessageUIAttachmentOption) ? (
    <MessageAttachmentPreview
      messageId={messageId}
      attachment={thirdPartyMessageUIAttachmentOption.value}
      onPDFError={() => {
        trackThirdPartyMessageAttachmentCorruptedFile(messageId, serviceId);
        showToast(I18n.t("messageDetails.attachments.corruptedFile"));
      }}
      onLoadComplete={() => {
        trackThirdPartyMessageAttachmentPreviewSuccess();
      }}
      onDownload={() => {
        trackThirdPartyMessageAttachmentUserAction("download");
      }}
      onOpen={() => {
        trackThirdPartyMessageAttachmentUserAction("open");
      }}
      onShare={() => {
        trackThirdPartyMessageAttachmentUserAction("share");
      }}
    />
  ) : (
    <></>
  );
};
