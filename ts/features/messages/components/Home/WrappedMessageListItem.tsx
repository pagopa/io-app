import React, { useCallback, useMemo } from "react";
import { pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { UIMessage } from "../../types";
import I18n from "../../../../i18n";
import { TagEnum as PaymentTagEnum } from "../../../../../definitions/backend/MessageCategoryPayment";
import { TagEnum as SENDTagEnum } from "../../../../../definitions/backend/MessageCategoryPN";
import { convertDateToWordDistance } from "../../utils/convertDateToWordDistance";
import {
  useIONavigation,
  useIOTabNavigation
} from "../../../../navigation/params/AppParamsList";
import { MESSAGES_ROUTES } from "../../navigation/routes";
import { logoForService } from "../../../services/home/utils";
import {
  scheduledPreconditionStatusAction,
  toScheduledPayload
} from "../../store/actions/preconditions";
import { isPaymentMessageWithPaidNoticeSelector } from "../../store/reducers/allPaginated";
import { toggleScheduledMessageArchivingAction } from "../../store/actions/archiving";
import { MessageListCategory } from "../../types/messageListCategory";
import { accessibilityLabelForMessageItem } from "./homeUtils";
import { MessageListItem } from "./DS/MessageListItem";

type WrappedMessageListItemProps = {
  index: number;
  listCategory: MessageListCategory;
  message: UIMessage;
};

export const WrappedMessageListItem = ({
  index,
  listCategory,
  message
}: WrappedMessageListItemProps) => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const tabNavigation = useIOTabNavigation();
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

  const onLongPressCallback = useCallback(() => {
    tabNavigation.setOptions({
      tabBarStyle: { display: "none" }
    });
    dispatch(
      toggleScheduledMessageArchivingAction({
        messageId: message.id,
        fromInboxToArchive: listCategory === "INBOX"
      })
    );
  }, [dispatch, listCategory, message, tabNavigation]);
  const onPressCallback = useCallback(
    () =>
      // TODO handle archiving
      pipe(
        message.hasPrecondition,
        B.fold(
          () =>
            navigation.navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
              screen: MESSAGES_ROUTES.MESSAGE_ROUTER,
              params: {
                messageId: message.id,
                fromNotification: false
              }
            }),
          () =>
            pipe(
              toScheduledPayload(message.id, message.category.tag),
              scheduledPreconditionStatusAction,
              dispatch
            )
        )
      ),
    [dispatch, message, navigation]
  );

  // TODO update archiving UI
  return (
    <MessageListItem
      accessibilityLabel={accessibilityLabel}
      badgeText={badgeText}
      badgeVariant={badgeVariant}
      doubleAvatar={doubleAvatar}
      formattedDate={messageDate}
      isRead={isRead}
      messageTitle={messageTitle}
      onLongPress={onLongPressCallback}
      onPress={onPressCallback}
      organizationName={organizationName}
      serviceLogos={serviceLogoUriSources}
      serviceName={serviceName}
      testID={`wrapped_message_list_item_${index}`}
    />
  );
};
