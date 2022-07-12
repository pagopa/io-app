import React from "react";
import { CompatNavigationProp } from "@react-navigation/compat";
import { MvlAttachmentId } from "../../../../types/mvlData";
import { IOStackNavigationProp } from "../../../../../../navigation/params/AppParamsList";
import { MvlParamsList } from "../../../../navigation/params";
import { MessageAttachmentPreview } from "../../../../../messages/components/MessageAttachmentPreview";

export type MvlAttachmentPreviewNavigationParams = Readonly<{
  attachmentId: MvlAttachmentId;
}>;

type Props = {
  navigation: CompatNavigationProp<
    IOStackNavigationProp<MvlParamsList, "MVL_ATTACHMENT">
  >;
};

export const MvlAttachmentPreview = (props: Props): React.ReactElement => {
  const attachmentId = props.navigation.getParam("attachmentId");
  return <MessageAttachmentPreview attachmentId={attachmentId} />;
};
