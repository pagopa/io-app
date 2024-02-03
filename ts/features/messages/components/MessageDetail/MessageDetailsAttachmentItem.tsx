import React from "react";
import { VSpacer } from "@pagopa/io-app-design-system";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { ThirdPartyAttachment } from "../../../../../definitions/backend/ThirdPartyAttachment";
import { UIMessageId } from "../../types";
import { useAttachmentDownload } from "../../hooks/useAttachmentDownload";
import { ModuleAttachment } from "./ModuleAttachment";

type MessageDetailsAttachmentItemProps = {
  attachment: ThirdPartyAttachment;
  bottomSpacer?: boolean;
  messageId: UIMessageId;
  serviceId?: ServiceId;
};

export const MessageDetailsAttachmentItem = ({
  attachment,
  bottomSpacer,
  messageId,
  serviceId
}: MessageDetailsAttachmentItemProps) => {
  const { displayName, isFetching, onModuleAttachmentPress } =
    useAttachmentDownload(messageId, attachment, serviceId);

  // TODO fetching accessibility label
  return (
    <>
      <ModuleAttachment
        title={displayName}
        isFetching={isFetching}
        format={"pdf"}
        onPress={() => void onModuleAttachmentPress()}
      />
      {bottomSpacer && <VSpacer size={8} />}
    </>
  );
};
