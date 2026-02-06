import { ModuleAttachment, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useAttachmentDownload } from "../../hooks/useAttachmentDownload";
import {
  SendOpeningSource,
  SendUserType
} from "../../../pushNotifications/analytics";
import { ThirdPartyAttachment } from "../../../../../definitions/backend/communication/ThirdPartyAttachment";
import { ServiceId } from "../../../../../definitions/services/ServiceId";

export type MessageDetailsAttachmentItemProps = {
  attachment: ThirdPartyAttachment;
  bottomSpacer?: boolean;
  disabled?: boolean;
  sendOpeningSource: SendOpeningSource;
  sendUserType: SendUserType;
  messageId: string;
  onPreNavigate?: () => void;
  serviceId: ServiceId;
};

export const MessageDetailsAttachmentItem = ({
  attachment,
  bottomSpacer,
  disabled = false,
  sendOpeningSource,
  sendUserType,
  messageId,
  onPreNavigate = undefined,
  serviceId
}: MessageDetailsAttachmentItemProps) => {
  const { displayName, isFetching, onModuleAttachmentPress } =
    useAttachmentDownload(
      messageId,
      attachment,
      sendOpeningSource,
      sendUserType,
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
