import { ModuleAttachment, VSpacer } from "@pagopa/io-app-design-system";
import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { ThirdPartyAttachment } from "../../../../../definitions/communications/ThirdPartyAttachment";
import { UIMessageId } from "../../types";
import { useAttachmentDownload } from "../../hooks/useAttachmentDownload";
import I18n from "../../../../i18n";

type MessageDetailsAttachmentItemProps = {
  attachment: ThirdPartyAttachment;
  bottomSpacer?: boolean;
  disabled?: boolean;
  isPN?: boolean;
  messageId: UIMessageId;
  onPreNavigate?: () => void;
  serviceId?: ServiceId;
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
