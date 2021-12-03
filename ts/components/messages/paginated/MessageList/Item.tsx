/**
 * A component to display the list item in the MessagesHomeScreen
 */
import React from "react";

import { ServicePublic } from "../../../../../definitions/backend/ServicePublic";
import I18n from "../../../../i18n";
import {
  convertDateToWordDistance,
  convertReceivedDateToAccessible
} from "../../../../utils/convertDateToWordDistance";
import {
  MessageCategory,
  UIMessage
} from "../../../../store/reducers/entities/messages/types";
import DetailedlistItemComponent from "../../../DetailedlistItemComponent";
import { category } from "fp-ts";

type Props = {
  category: MessageCategory;
  hasPaidBadge: boolean;
  isRead: boolean;
  isArchived: boolean;
  isSelected: boolean;
  isSelectionModeEnabled: boolean;
  message: UIMessage;
  onLongPress: () => void;
  onPress: () => void;
  service?: ServicePublic;
};

const UNKNOWN_SERVICE_DATA = {
  organizationName: I18n.t("messages.errorLoading.senderInfo"),
  serviceName: I18n.t("messages.errorLoading.serviceInfo")
};

const announceMessage = (message: UIMessage, isRead: boolean): string =>
  I18n.t("messages.accessibility.message.description", {
    newMessage: isRead
      ? I18n.t("messages.accessibility.message.read")
      : I18n.t("messages.accessibility.message.unread"),
    organizationName: message.organizationName,
    serviceName: message.serviceName,
    subject: message.title,
    receivedAt: convertReceivedDateToAccessible(message.createdAt)
  });

/**
 * TODO: please merge this component with DetailedlistItemComponent since it is here
 *       only to provide backward compatibility with the legacy components.
 */
const MessageListItem = ({
  category,
  hasPaidBadge,
  isRead,
  isArchived,
  isSelected,
  isSelectionModeEnabled,
  message,
  onLongPress,
  onPress
}: Props) => {
  const uiDate = convertDateToWordDistance(
    message.createdAt,
    I18n.t("messages.yesterday")
  );

  return (
    <DetailedlistItemComponent
      category={category}
      isNew={!isRead}
      isArchived={isArchived}
      onPressItem={onPress}
      text11={message.organizationName || UNKNOWN_SERVICE_DATA.organizationName}
      text12={uiDate}
      text2={message.serviceName || UNKNOWN_SERVICE_DATA.serviceName}
      text3={message.title || I18n.t("messages.errorLoading.noTitle")}
      onLongPressItem={onLongPress}
      isSelectionModeEnabled={isSelectionModeEnabled}
      isItemSelected={isSelected}
      isPaid={hasPaidBadge}
      accessible={true}
      accessibilityLabel={announceMessage(message, isRead)}
    />
  );
};

export default MessageListItem;
