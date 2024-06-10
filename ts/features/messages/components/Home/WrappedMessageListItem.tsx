import React, { useMemo } from "react";
import { UIMessage } from "../../types";
import I18n from "../../../../i18n";
import { TagEnum } from "../../../../../definitions/backend/MessageCategoryPN";
import { convertDateToWordDistance } from "../../utils/convertDateToWordDistance";
import { logoForService } from "../../../services/home/utils";
import { accessibilityLabelForMessageItem } from "./homeUtils";
import { MessageListItem } from "./DS/MessageListItem";

type WrappedMessageListItemProps = {
  message: UIMessage;
};

export const WrappedMessageListItem = ({
  message
}: WrappedMessageListItemProps) => {
  const serviceId = message.serviceId;
  const organizationFiscalCode = message.organizationFiscalCode;

  const serviceLogoUriSources = useMemo(
    () => logoForService(serviceId, organizationFiscalCode),
    [serviceId, organizationFiscalCode]
  );
  const organizationName =
    message.organizationName || I18n.t("messages.errorLoading.senderInfo");
  const serviceName =
    message.serviceName || I18n.t("messages.errorLoading.serviceInfo");
  const messageTitle = message.title || I18n.t("messages.errorLoading.noTitle");
  const messageDate = convertDateToWordDistance(
    message.createdAt,
    I18n.t("messages.yesterday")
  );
  const isRead = message.isRead;
  const badgeText =
    message.category.tag === TagEnum.PN
      ? I18n.t("features.pn.details.badge.legalValue")
      : undefined;
  const accessibilityLabel = useMemo(
    () => accessibilityLabelForMessageItem(message),
    [message]
  );

  return (
    <MessageListItem
      accessibilityLabel={accessibilityLabel}
      serviceName={serviceName}
      messageTitle={messageTitle}
      onLongPress={() => undefined}
      onPress={() => undefined}
      serviceLogos={serviceLogoUriSources}
      badgeText={badgeText}
      isRead={isRead}
      organizationName={organizationName}
      formattedDate={messageDate}
    />
  );
};
