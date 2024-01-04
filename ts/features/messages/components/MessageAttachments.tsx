import React from "react";
import { View } from "react-native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { VSpacer, WithTestID } from "@pagopa/io-app-design-system";
import { UIAttachment } from "../../../store/reducers/entities/messages/types";
import { ContentTypeValues } from "../types/contentType";
import { useAttachmentDownload } from "../hooks/useAttachmentDownload";
import { ModuleAttachment, ModuleAttachmentProps } from "./ModuleAttachment";

type PartialProps = {
  downloadAttachmentBeforePreview?: boolean;
  openPreview: (attachment: UIAttachment) => void;
};

type MessageAttachmentProps = {
  attachment: UIAttachment;
} & PartialProps;

type MessageAttachmentsProps = WithTestID<
  {
    attachments: ReadonlyArray<UIAttachment>;
  } & PartialProps
>;

const getFormatByContentType = (
  contentType: UIAttachment["contentType"]
): ModuleAttachmentProps["format"] => {
  switch (contentType) {
    case ContentTypeValues.applicationPdf:
      return "pdf";
    default:
      return "doc";
  }
};

const AttachmentItem = ({
  attachment,
  openPreview,
  downloadAttachmentBeforePreview
}: MessageAttachmentProps) => {
  const { downloadPot, onAttachmentSelect } = useAttachmentDownload(
    attachment,
    downloadAttachmentBeforePreview,
    openPreview
  );

  return (
    <ModuleAttachment
      testID="message-attachment"
      format={getFormatByContentType(attachment.contentType)}
      title={attachment.displayName}
      isFetching={pot.isLoading(downloadPot)}
      onPress={onAttachmentSelect}
    />
  );
};

export const MessageAttachments = ({
  attachments = [],
  testID,
  ...rest
}: MessageAttachmentsProps) => (
  <View testID={testID}>
    {attachments.map((attachment, index) => (
      <React.Fragment key={index}>
        <AttachmentItem {...rest} attachment={attachment} />
        {index < attachments.length - 1 && <VSpacer size={8} />}
      </React.Fragment>
    ))}
  </View>
);
