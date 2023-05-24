import React, { useEffect, useRef } from "react";
import * as O from "fp-ts/lib/Option";
import { PnParamsList } from "../navigation/params";
import {
  UIMessageId,
  UIAttachmentId
} from "../../../store/reducers/entities/messages/types";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { MessageAttachmentPreview } from "../../messages/components/MessageAttachmentPreview";
import { useIOSelector } from "../../../store/hooks";
import { pnMessageAttachmentSelector } from "../store/reducers";
import {
  trackPNAttachmentOpen,
  trackPNAttachmentPreviewStatus,
  trackPNAttachmentSave,
  trackPNAttachmentShare
} from "../analytics";

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
  // This ref is needed otherwise the auto back on the useEffect will fire multiple
  // times, since its dependencies change during the back navigation
  const autoBackOnErrorHandled = useRef(false);
  const pnMessageAttachmentOption = useIOSelector(state =>
    pnMessageAttachmentSelector(state)(messageId)(attachmentId)
  );

  useEffect(() => {
    // This condition happens only if this screen is shown without having
    // first retrieved the third party message (so it should never happen)
    if (
      !autoBackOnErrorHandled.current &&
      O.isNone(pnMessageAttachmentOption)
    ) {
      // eslint-disable-next-line functional/immutable-data
      autoBackOnErrorHandled.current = true;
      navigation.goBack();
    }
  }, [pnMessageAttachmentOption, navigation]);

  return O.isSome(pnMessageAttachmentOption) ? (
    <MessageAttachmentPreview
      messageId={messageId}
      attachment={pnMessageAttachmentOption.value}
      onPDFError={() => trackPNAttachmentPreviewStatus("error")}
      onLoadComplete={() => () => trackPNAttachmentPreviewStatus("displayed")}
      onShare={() => trackPNAttachmentShare()}
      onOpen={() => trackPNAttachmentOpen()}
      onDownload={() => trackPNAttachmentSave()}
    />
  ) : (
    <></>
  );
};
