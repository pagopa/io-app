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

class MessageListItem extends React.PureComponent<Props> {
  announceMessage = (message: UIMessage) =>
    // TODO: establish relation
    // const newMessage = message.isRead
    //   ? I18n.t("messages.accessibility.message.read")
    //   : I18n.t("messages.accessibility.message.unread");
    I18n.t("messages.accessibility.message.description", {
      organizationName: message.organizationName,
      serviceName: message.serviceName,
      subject: message.title,
      receivedAt: convertReceivedDateToAccessible(message.createdAt)
    });

  render() {
    const {
      hasPaidBadge,
      isRead,
      isSelected,
      isSelectionModeEnabled,
      message,
      onLongPress,
      onPress
    } = this.props;

    const uiDate = convertDateToWordDistance(
      message.createdAt,
      I18n.t("messages.yesterday")
    );

    return (
      <DetailedlistItemComponent
        isNew={!isRead}
        onPressItem={onPress}
        text11={
          message.organizationName || UNKNOWN_SERVICE_DATA.organizationName
        }
        text12={uiDate}
        text2={message.serviceName || UNKNOWN_SERVICE_DATA.serviceName}
        text3={message.title || "no title"}
        onLongPressItem={onLongPress}
        isSelectionModeEnabled={isSelectionModeEnabled}
        isItemSelected={isSelected}
        isPaid={hasPaidBadge}
        accessible={true}
        accessibilityLabel={this.announceMessage(message)}
      />
    );
  }
}

export default MessageListItem;
