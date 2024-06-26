import React, { useCallback, useMemo } from "react";
import { UIMessage } from "../../types";
import I18n from "../../../../i18n";
import { TagEnum as PaymentTagEnum } from "../../../../../definitions/backend/MessageCategoryPayment";
import { TagEnum as SENDTagEnum } from "../../../../../definitions/backend/MessageCategoryPN";
import { convertDateToWordDistance } from "../../utils/convertDateToWordDistance";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { MESSAGES_ROUTES } from "../../navigation/routes";
import { logoForService } from "../../../services/home/utils";
import { useIOSelector } from "../../../../store/hooks";
import { isPaymentMessageWithPaidNoticeSelector } from "../../store/reducers/allPaginated";
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

  const isPaymentMessageWithPaidNotice = useIOSelector(state =>
    isPaymentMessageWithPaidNoticeSelector(state, message.category)
  );

  const messageCategoryTag = message.category.tag;
  const doubleAvatar = messageCategoryTag === PaymentTagEnum.PAYMENT;
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
    messageCategoryTag === SENDTagEnum.PN
      ? I18n.t("features.pn.details.badge.legalValue")
      : isPaymentMessageWithPaidNotice
      ? I18n.t("messages.badge.paid")
      : undefined;
  const badgeVariant =
    messageCategoryTag === SENDTagEnum.PN
      ? "legalMessage"
      : isPaymentMessageWithPaidNotice
      ? "success"
      : undefined;
  const accessibilityLabel = useMemo(
    () => accessibilityLabelForMessageItem(message),
    [message]
  );

  const onPressCallback = useCallback(() => {
    if (message.category.tag === SENDTagEnum.PN || message.hasPrecondition) {
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
      badgeText={badgeText}
      badgeVariant={badgeVariant}
      doubleAvatar={doubleAvatar}
      formattedDate={messageDate}
      isRead={isRead}
      messageTitle={messageTitle}
      onLongPress={() => undefined}
      onPress={onPressCallback}
      organizationName={organizationName}
      serviceLogos={serviceLogoUriSources}
      serviceName={serviceName}
      testID={`wrapped_message_list_item_${index}`}
    />
  );
};
