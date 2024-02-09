import React from "react";
import { View } from "react-native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { VSpacer, WithTestID } from "@pagopa/io-app-design-system";
import { ContentTypeValues } from "../../messages/types/contentType";
import {
  LegacyModuleAttachment,
  LegacyModuleAttachmentProps
} from "../../messages/components/MessageDetail/LegacyModuleAttachment";
import { useLegacyAttachmentDownload } from "../../messages/hooks/useLegacyAttachmentDownload";
import { ThirdPartyAttachment } from "../../../../definitions/backend/ThirdPartyAttachment";
import { UIMessageId } from "../../messages/types";
import {
  attachmentContentType,
  attachmentDisplayName
} from "../../messages/store/reducers/transformers";

type PartialProps = {
  downloadAttachmentBeforePreview?: boolean;
  openPreview: (attachment: ThirdPartyAttachment) => void;
};

type MessageAttachmentProps = {
  attachment: ThirdPartyAttachment;
  messageId: UIMessageId;
} & PartialProps;

type MessageAttachmentsProps = WithTestID<
  {
    attachments: ReadonlyArray<ThirdPartyAttachment>;
    messageId: UIMessageId;
  } & PartialProps
>;

const getFormatByContentType = (
  contentType: string
): LegacyModuleAttachmentProps["format"] => {
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
  downloadAttachmentBeforePreview,
  messageId
}: MessageAttachmentProps) => {
  const { downloadPot, onAttachmentSelect } = useLegacyAttachmentDownload(
    attachment,
    messageId,
    downloadAttachmentBeforePreview,
    openPreview
  );

  const name = attachmentDisplayName(attachment);
  const mimeType = attachmentContentType(attachment);
  return (
    <LegacyModuleAttachment
      testID="message-attachment"
      format={getFormatByContentType(mimeType)}
      title={name}
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
