import { Body, ListItemHeader, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIOSelector } from "../../../store/hooks";
import { thirdPartyMessageAttachments } from "../../messages/store/reducers/thirdPartyById";
import { ATTACHMENT_CATEGORY } from "../../messages/types/attachmentCategory";
import { MessageDetailsAttachmentItem } from "../../messages/components/MessageDetail/MessageDetailsAttachmentItem";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import {
  SendOpeningSource,
  SendUserType
} from "../../pushNotifications/analytics";
import { F24ListBottomSheetLink } from "./F24ListBottomSheetLink";

export type F24SectionProps = {
  isCancelled?: boolean;
  messageId: string;
  serviceId: ServiceId;
  sendOpeningSource: SendOpeningSource;
  sendUserType: SendUserType;
};

export const F24Section = ({
  isCancelled = false,
  messageId,
  serviceId,
  sendOpeningSource,
  sendUserType
}: F24SectionProps) => {
  const attachments = useIOSelector(state =>
    thirdPartyMessageAttachments(state, messageId)
  );
  const f24s = attachments.filter(
    attachment => attachment.category === ATTACHMENT_CATEGORY.F24
  );
  const f24Count = f24s.length;
  if (isCancelled || f24Count === 0) {
    return null;
  }

  return (
    <>
      <ListItemHeader
        label={I18n.t("features.pn.details.f24Section.title")}
        iconName={"folder"}
      />
      <Body>{I18n.t("features.pn.details.f24Section.description")}</Body>
      <VSpacer size={24} />
      {f24Count === 1 && (
        <MessageDetailsAttachmentItem
          attachment={f24s[0]}
          messageId={messageId}
          serviceId={serviceId}
          sendOpeningSource={sendOpeningSource}
          sendUserType={sendUserType}
        />
      )}
      {f24Count > 1 && (
        <F24ListBottomSheetLink
          f24List={f24s}
          messageId={messageId}
          serviceId={serviceId}
          sendOpeningSource={sendOpeningSource}
          sendUserType={sendUserType}
        />
      )}
      <VSpacer size={16} />
    </>
  );
};
