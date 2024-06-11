import React, { useCallback, useMemo } from "react";
import { UIMessage } from "../../types";
import I18n from "../../../../i18n";
import { TagEnum } from "../../../../../definitions/backend/MessageCategoryPN";
import { convertDateToWordDistance } from "../../utils/convertDateToWordDistance";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { MESSAGES_ROUTES } from "../../navigation/routes";
import { logoForService } from "../../../services/home/utils";
import { accessibilityLabelForMessageItem } from "./homeUtils";
import { MessageListItem } from "./DS/MessageListItem";

type WrappedMessageListItemProps = {
  index: number;
  message: UIMessage;
};

export const WrappedMessageListItem = ({
  index,
  message
}: WrappedMessageListItemProps) => {
  const navigation = useIONavigation();
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

  const onPressCallback = useCallback(() => {
    if (message.category.tag === TagEnum.PN || message.hasPrecondition) {
      // TODO preconditions IOCOM-840
      return;
    }
    navigation.navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
      screen: MESSAGES_ROUTES.MESSAGE_ROUTER,
      params: {
        messageId: message.id,
        fromNotification: false
      }
    });
  }, [message, navigation]);

  return (
    <MessageListItem
      accessibilityLabel={accessibilityLabel}
      serviceName={serviceName}
      messageTitle={messageTitle}
      onLongPress={() => undefined}
      onPress={onPressCallback}
      serviceLogos={serviceLogoUriSources}
      badgeText={badgeText}
      isRead={isRead}
      organizationName={organizationName}
      formattedDate={messageDate}
      testID={`wrapped_message_list_item_${index}`}
    />
  );
};
