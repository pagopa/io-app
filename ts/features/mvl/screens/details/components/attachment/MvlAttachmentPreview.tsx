import * as pot from "@pagopa/ts-commons/lib/pot";
import React, { useEffect } from "react";
import { IOStackNavigationRouteProps } from "../../../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../../../store/hooks";
import {
  UIAttachmentId,
  UIMessageId
} from "../../../../../../store/reducers/entities/messages/types";
import { MessageAttachmentPreview } from "../../../../../messages/components/MessageAttachmentPreview";
import { MvlParamsList } from "../../../../navigation/params";
import { mvlFromIdSelector } from "../../../../store/reducers/byId";

export type MvlAttachmentPreviewNavigationParams = Readonly<{
  messageId: UIMessageId;
  attachmentId: UIAttachmentId;
}>;

export const MvlAttachmentPreview = (
  props: IOStackNavigationRouteProps<MvlParamsList, "MVL_ATTACHMENT">
): React.ReactElement => {
  const navigation = props.navigation;
  const messageId = props.route.params.messageId;
  const attachmentId = props.route.params.attachmentId;
  const mvlMessagePot = useIOSelector(state =>
    mvlFromIdSelector(state, messageId)
  );
  const attachment = pot.isSome(mvlMessagePot)
    ? mvlMessagePot.value?.legalMessage?.attachments?.find(
        a => a.id === attachmentId
      )
    : undefined;

  useEffect(() => {
    // This condition happens only if this screen is shown without having
    // first retrieved the third party message (so it should never happen)
    if (!attachment) {
      navigation.goBack();
    }
  }, [attachment, navigation]);

  return attachment ? (
    <MessageAttachmentPreview messageId={messageId} attachment={attachment} />
  ) : (
    <></>
  );
};
