import { useCallback, useMemo, useRef } from "react";
import { AccessibilityInfo } from "react-native";
import I18n from "i18next";
import { isScreenReaderEnabledSelector } from "../../../../store/reducers/preferences";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
import { UIMessage } from "../../types";
import { TagEnum as PaymentTagEnum } from "../../../../../definitions/backend/communication/MessageCategoryPayment";
import { TagEnum as SENDTagEnum } from "../../../../../definitions/backend/communication/MessageCategoryPN";
import { convertDateToWordDistance } from "../../utils/convertDateToWordDistance";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { MESSAGES_ROUTES } from "../../navigation/routes";
import { isAndroid } from "../../../../utils/platform";
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
import { ListItemMessage, ListItemMessageProps } from "./DS/ListItemMessage";

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
  const avatarDouble = messageCategoryTag === PaymentTagEnum.PAYMENT;
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

  const tag: ListItemMessageProps["tag"] =
    messageCategoryTag === SENDTagEnum.PN
      ? {
          variant: "legalMessage",
          text: I18n.t("features.pn.details.badge.legalValue")
        }
      : isPaymentMessageWithPaidNotice
      ? {
          variant: "success",
          text: I18n.t("messages.badge.paid")
        }
      : undefined;

  const accessibilityLabel = useMemo(
    () => accessibilityLabelForMessageItem(message, source, isSelected),
    [isSelected, message, source]
  );

  const toggleScheduledMessageArchivingCallback = useCallback(
    (forceAccessibilityAnnounce: boolean) => {
      const state = store.getState();
      if (
        isInboxOrArchiveSource(source) &&
        !isArchivingInProcessingModeSelector(state)
      ) {
        // When the onLongPress event is triggered, VoiceOver and TalkBack do
        // not announce the accessibilityLabel of the ListItemMessage so we
        // have to force the announcement (but we do it only if VoiceOver and
        // TalkBack are enabled). Unfortunately, programmatically requesting
        // the announcement disables the automatic announcement on Android
        // if the standard selection gesture (onPress) is used to select /
        // deselect a message for archiving/unarchiving, so on Android we
        // always have to force the announcement.
        if (forceAccessibilityAnnounce) {
          const isScreenReaderEnabled = isScreenReaderEnabledSelector(state);
          if (isScreenReaderEnabled) {
            const announcement = accessibilityLabelForMessageItem(
              message,
              source,
              !isSelected
            );
            AccessibilityInfo.announceForAccessibility(announcement);
          }
        }
        dispatch(
          toggleScheduledMessageArchivingAction({
            messageId: message.id,
            fromInboxToArchive: isInboxSource(source)
          })
        );
      }
    },
    [dispatch, isSelected, message, source, store]
  );

  const onPressCallback = useCallback(() => {
    const state = store.getState();
    if (
      isInboxOrArchiveSource(source) &&
      isArchivingInSchedulingModeSelector(state)
    ) {
      // The workaround to force the announcement of the accessibilityLabel
      // when the onLongPress event is triggered disables the automatic
      // announcement on Android for the standard selection gesture (onPress),
      // so we must handle that case here
      toggleScheduledMessageArchivingCallback(isAndroid);
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
      tag={tag}
      avatarDouble={avatarDouble}
      formattedDate={messageDate}
      isRead={isRead}
      messageTitle={messageTitle}
      // Accessibility label is not announced if the onLonPress
      // event is triggered, so we have to force the announcement
      onLongPress={() => toggleScheduledMessageArchivingCallback(true)}
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
