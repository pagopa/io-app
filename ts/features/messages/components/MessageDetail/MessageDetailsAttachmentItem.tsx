import { ModuleAttachment, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { ThirdPartyAttachment } from "../../../../../definitions/backend/ThirdPartyAttachment";
import { useAttachmentDownload } from "../../hooks/useAttachmentDownload";

export type MessageDetailsAttachmentItemProps = {
  attachment: ThirdPartyAttachment;
  bottomSpacer?: boolean;
  disabled?: boolean;
  isPN?: boolean;
  messageId: string;
  onPreNavigate?: () => void;
  serviceId: ServiceId;
};

export const MessageDetailsAttachmentItem = ({
  attachment,
  bottomSpacer,
  disabled = false,
  isPN = false,
  messageId,
  onPreNavigate = undefined,
  serviceId
}: MessageDetailsAttachmentItemProps) => {
  const { displayName, isFetching, onModuleAttachmentPress } =
    useAttachmentDownload(
      messageId,
      attachment,
      isPN,
      serviceId,
      onPreNavigate
    );
  return (
    <>
      <ModuleAttachment
        disabled={disabled}
        fetchingAccessibilityLabel={I18n.t(
          "features.messages.attachmentDownloadFeedback"
        )}
        format={"pdf"}
        isFetching={isFetching}
        onPress={() => void onModuleAttachmentPress()}
        title={displayName}
      />
      {bottomSpacer && <VSpacer size={8} />}
    </>
  );
};
