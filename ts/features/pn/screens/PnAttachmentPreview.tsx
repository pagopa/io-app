import React from "react";
import { PnParamsList } from "../navigation/params";
import { MvlAttachmentId } from "../../mvl/types/mvlData";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { MessageAttachmentPreview } from "../../messages/components/MessageAttachmentPreview";

export type PnAttachmentPreviewNavigationParams = Readonly<{
  attachmentId: MvlAttachmentId;
}>;

export const PnAttachmentPreview = (
  props: IOStackNavigationRouteProps<
    PnParamsList,
    "PN_ROUTES_MESSAGE_ATTACHMENT"
  >
): React.ReactElement => {
  const attachmentId = props.route.params.attachmentId;
  return <MessageAttachmentPreview attachmentId={attachmentId} />;
};
