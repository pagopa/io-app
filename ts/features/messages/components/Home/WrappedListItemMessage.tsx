import React, { useCallback, useMemo, useRef } from "react";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
import { UIMessage } from "../../types";
import I18n from "../../../../i18n";
import { TagEnum as PaymentTagEnum } from "../../../../../definitions/backend/MessageCategoryPayment";
import { TagEnum as SENDTagEnum } from "../../../../../definitions/backend/MessageCategoryPN";
import { convertDateToWordDistance } from "../../utils/convertDateToWordDistance";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { MESSAGES_ROUTES } from "../../navigation/routes";
import { logoForService } from "../../../services/home/utils";
import {
  scheduledPreconditionStatusAction,
  toScheduledPayload
} from "../../store/actions/preconditions";
import { isPaymentMessageWithPaidNoticeSelector } from "../../store/reducers/allPaginated";
import { toggleScheduledMessageArchivingAction } from "../../store/actions/archiving";
import { MessageListCategory } from "../../types/messageListCategory";
import {
  isMessageScheduledForArchivingSelector,
  isArchivingInSchedulingModeSelector,
  isArchivingDisabledSelector,
  isArchivingInProcessingModeSelector
} from "../../store/reducers/archiving";
import { trackMessageSearchSelection } from "../../analytics";
import {
  accessibilityLabelForMessageItem,
  minDelayBetweenNavigationMilliseconds
} from "./homeUtils";
import { ListItemMessage } from "./DS/ListItemMessage";

type WrappedListItemMessage = {
  index: number;
  message: UIMessage;
  source: MessageListCategory | "SEARCH";
};

export const WrappedListItemMessage = ({
  index,
  message,
  source
}: WrappedListItemMessage) => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const store = useIOStore();
  const lastNavigationDate = useRef<Date>(new Date(0));

  const serviceId = message.serviceId;
  const organizationFiscalCode = message.organizationFiscalCode;

  const isPaymentMessageWithPaidNotice = useIOSelector(state =>
    isPaymentMessageWithPaidNoticeSelector(state, message.category)
  );
  const isSelected = useIOSelector(state =>
    isMessageScheduledForArchivingSelector(state, message.id)
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
    () => accessibilityLabelForMessageItem(message, isSelected),
    [isSelected, message]
  );

  const toggleScheduledMessageArchivingCallback = useCallback(() => {
    const state = store.getState();
    if (
      isInboxOrArchiveSource(source) &&
      !isArchivingInProcessingModeSelector(state)
    ) {
      dispatch(
        toggleScheduledMessageArchivingAction({
          messageId: message.id,
          fromInboxToArchive: isInboxSource(source)
        })
      );
    }
  }, [dispatch, message, source, store]);

  const onPressCallback = useCallback(() => {
    const state = store.getState();
    if (
      isInboxOrArchiveSource(source) &&
      isArchivingInSchedulingModeSelector(state)
    ) {
      toggleScheduledMessageArchivingCallback();
    } else if (isSearchSource(source) || isArchivingDisabledSelector(state)) {
      if (message.hasPrecondition) {
        dispatch(
          scheduledPreconditionStatusAction(
            toScheduledPayload(message.id, message.category.tag)
          )
        );
      } else {
        const now = new Date();
        if (
          lastNavigationDate.current.getTime() +
            minDelayBetweenNavigationMilliseconds >=
          now.getTime()
        ) {
          // This prevents an unwanted double tap that triggers
          // a dobule navigation towards the message details
          return;
        }
        // eslint-disable-next-line functional/immutable-data
        lastNavigationDate.current = now;

        if (isSearchSource(source)) {
          trackMessageSearchSelection();
        }

        navigation.navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
          screen: MESSAGES_ROUTES.MESSAGE_ROUTER,
          params: {
            messageId: message.id,
            fromNotification: false
          }
        });
      }
    }
  }, [
    dispatch,
    message,
    navigation,
    source,
    store,
    toggleScheduledMessageArchivingCallback
  ]);

  return (
    <ListItemMessage
      accessibilityLabel={accessibilityLabel}
      badgeText={badgeText}
      badgeVariant={badgeVariant}
      doubleAvatar={doubleAvatar}
      formattedDate={messageDate}
      isRead={isRead}
      messageTitle={messageTitle}
      onLongPress={toggleScheduledMessageArchivingCallback}
      onPress={onPressCallback}
      organizationName={organizationName}
      selected={isSelected}
      serviceLogos={serviceLogoUriSources}
      serviceName={serviceName}
      testID={`wrapped_message_list_item_${index}`}
    />
  );
};

export const isInboxOrArchiveSource = (
  source: WrappedListItemMessage["source"]
) => source === "ARCHIVE" || isInboxSource(source);
export const isInboxSource = (source: WrappedListItemMessage["source"]) =>
  source === "INBOX";
export const isSearchSource = (source: WrappedListItemMessage["source"]) =>
  source === "SEARCH";
