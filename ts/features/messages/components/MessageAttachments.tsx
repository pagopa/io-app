import React from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { WithTestID } from "@pagopa/io-app-design-system";
import { UIAttachment } from "../../../store/reducers/entities/messages/types";
import { ContentTypeValues } from "../../../types/contentType";
import { useAttachmentDownload } from "../hooks/useAttachmentDownload";
import {
  ModuleAttachment,
  ModuleAttachmentProps
} from "../../../components/ModuleAttachment";

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
  ...rest
}: MessageAttachmentsProps) => (
  <>
    {attachments.map((attachment, index) => (
      <AttachmentItem key={index} {...rest} attachment={attachment} />
    ))}
  </>
);
