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
import { UIMessage } from "../../../../store/reducers/entities/messages/types";
import DetailedlistItemComponent from "../../../DetailedlistItemComponent";

type Props = {
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

const MessageListItem = ({
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
      isNew={!isRead}
      isArchived={isArchived}
      onPressItem={onPress}
      text11={message.organizationName || UNKNOWN_SERVICE_DATA.organizationName}
      text12={uiDate}
      text2={message.serviceName || UNKNOWN_SERVICE_DATA.serviceName}
      text3={message.title || "no title"}
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
