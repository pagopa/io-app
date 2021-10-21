/**
 * A component to display the list item in the MessagesHomeScreen
 */
import React from "react";
import { ServicePublic } from "../../../../definitions/backend/ServicePublic";
import I18n from "../../../i18n";
import { PaidReason } from "../../../store/reducers/entities/payments";
import {
  convertDateToWordDistance,
  convertReceivedDateToAccessible
} from "../../../utils/convertDateToWordDistance";
import { UIMessage } from "../../../store/reducers/entities/messages/types";
import DetailedlistItemComponent from "../../DetailedlistItemComponent";

type Props = {
  isRead: boolean;
  message: UIMessage;
  service?: ServicePublic;
  payment?: PaidReason;
  onPress: (id: string) => void;
  onLongPress: (id: string) => void;
  isSelectionModeEnabled: boolean;
  isSelected: boolean;
};

const UNKNOWN_SERVICE_DATA = {
  organizationName: I18n.t("messages.errorLoading.senderInfo"),
  serviceName: I18n.t("messages.errorLoading.serviceInfo")
};

class MessageListItem extends React.PureComponent<Props> {
  private handlePress = () => {
    this.props.onPress(this.props.message.id);
  };

  private handleLongPress = () => {
    this.props.onLongPress(this.props.message.id);
  };

  private announceMessage = (message: UIMessage) => {
    // TODO: establish relation
    // const newMessage = message.isRead
    //   ? I18n.t("messages.accessibility.message.read")
    //   : I18n.t("messages.accessibility.message.unread");

    return I18n.t("messages.accessibility.message.description", {
      organizationName: message.organizationName,
      serviceName: message.serviceName,
      subject: message.title,
      receivedAt: convertReceivedDateToAccessible(message.createdAt)
    });
  };

  public render() {
    const { isRead, message, isSelectionModeEnabled, isSelected } = this.props;

    const uiDate = convertDateToWordDistance(
      message.createdAt,
      I18n.t("messages.yesterday")
    );

    return (
      <DetailedlistItemComponent
        isNew={!isRead}
        onPressItem={this.handlePress}
        text11={
          message.organizationName || UNKNOWN_SERVICE_DATA.organizationName
        }
        text12={uiDate}
        text2={message.serviceName || UNKNOWN_SERVICE_DATA.serviceName}
        text3={message.title || "no title"}
        onLongPressItem={this.handleLongPress}
        isSelectionModeEnabled={isSelectionModeEnabled}
        isItemSelected={isSelected}
        // isPaid={this.paid}
        accessible={true}
        accessibilityLabel={this.announceMessage(message)}
      />
    );
  }
}

export default MessageListItem;
