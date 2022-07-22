import React from "react";
import { MvlAttachmentId } from "../../../../types/mvlData";
import { IOStackNavigationRouteProps } from "../../../../../../navigation/params/AppParamsList";
import { MvlParamsList } from "../../../../navigation/params";
import { MessageAttachmentPreview } from "../../../../../messages/components/MessageAttachmentPreview";

export type MvlAttachmentPreviewNavigationParams = Readonly<{
  attachmentId: MvlAttachmentId;
}>;

export const MvlAttachmentPreview = (
  props: IOStackNavigationRouteProps<MvlParamsList, "MVL_ATTACHMENT">
): React.ReactElement => {
  const attachmentId = props.route.params.attachmentId;
  return <MessageAttachmentPreview attachmentId={attachmentId} />;
};
