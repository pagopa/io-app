import * as O from "fp-ts/lib/Option";
import React, { useEffect, useRef } from "react";
import { IOStackNavigationRouteProps } from "../../../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../../../store/hooks";
import {
  UIAttachmentId,
  UIMessageId
} from "../../../../../../store/reducers/entities/messages/types";
import { MessageAttachmentPreview } from "../../../../../messages/components/MessageAttachmentPreview";
import { MvlParamsList } from "../../../../navigation/params";
import { mvlMessageAttachmentSelector } from "../../../../store/reducers/byId";

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
  // This ref is needed otherwise the auto back on the useEffect will fire multiple
  // times, since its dependencies change during the back navigation
  const autoBackOnErrorHandled = useRef(false);
  const mvlMessageAttachmentOption = useIOSelector(state =>
    mvlMessageAttachmentSelector(state)(messageId)(attachmentId)
  );

  useEffect(() => {
    // This condition happens only if this screen is shown without having
    // first retrieved the third party message (so it should never happen)
    if (
      !autoBackOnErrorHandled.current &&
      O.isNone(mvlMessageAttachmentOption)
    ) {
      // eslint-disable-next-line functional/immutable-data
      autoBackOnErrorHandled.current = true;
      navigation.goBack();
    }
  }, [mvlMessageAttachmentOption, navigation]);

  return O.isSome(mvlMessageAttachmentOption) ? (
    <MessageAttachmentPreview
      messageId={messageId}
      attachment={mvlMessageAttachmentOption.value}
    />
  ) : (
    <></>
  );
};
