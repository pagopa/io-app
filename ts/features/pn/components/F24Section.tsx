import * as React from "react";
import {
  Body,
  ButtonLink,
  ListItemHeader,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "../../../i18n";
import { UIMessageId } from "../../messages/types";
import { useIOSelector } from "../../../store/hooks";
import { thirdPartyMessageAttachments } from "../../messages/store/reducers/thirdPartyById";
import { ATTACHMENT_CATEGORY } from "../../messages/types/attachmentCategory";
import { MessageDetailsAttachmentItem } from "../../messages/components/MessageDetail/MessageDetailsAttachmentItem";
import { ServiceId } from "../../../../definitions/backend/ServiceId";

type F24SectionProps = {
  isCancelled?: boolean;
  messageId: UIMessageId;
  serviceId: ServiceId;
};

export const F24Section = ({
  isCancelled = false,
  messageId,
  serviceId
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
      <Body color="grey-850">
        {I18n.t("features.pn.details.f24Section.description")}
      </Body>
      <VSpacer size={24} />
      {f24Count === 1 && (
        <MessageDetailsAttachmentItem
          attachment={f24s[0]}
          messageId={messageId}
          serviceId={serviceId}
          isPN
        />
      )}
      {f24Count > 1 && (
        <ButtonLink
          onPress={() => undefined}
          label={I18n.t("features.pn.details.f24Section.showAll")}
          accessibilityLabel={I18n.t("features.pn.details.f24Section.showAll")}
        />
      )}
      <VSpacer size={16} />
    </>
  );
};
