/**
 * A component to display the list item in the MessagesHomeScreen
 */
import { fromNullable } from "fp-ts/lib/Option";
import { View } from "native-base";
import React from "react";
import { CreatedMessageWithContentAndAttachments } from "../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import { PaidReason } from "../../store/reducers/entities/payments";
import {
  convertDateToWordDistance,
  convertReceivedDateToAccessible
} from "../../utils/convertDateToWordDistance";
import { hasPrescriptionData, messageNeedsCTABar } from "../../utils/messages";
import DetailedlistItemComponent from "../DetailedlistItemComponent";
import MessageListCTABar from "./MessageListCTABar";

type Props = {
  isRead: boolean;
  message: CreatedMessageWithContentAndAttachments;
  service?: ServicePublic;
  payment?: PaidReason;
  onPress: (id: string) => void;
  onLongPress: (id: string) => void;
  isSelectionModeEnabled: boolean;
  isSelected: boolean;
};

type Message = {
  isRead: boolean;
  organizationName: string;
  serviceName: string;
} & CreatedMessageWithContentAndAttachments;

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

  private announceMessage = (message: Message) => {
    const newMessage = message.isRead
      ? I18n.t("messages.accessibility.message.read")
      : I18n.t("messages.accessibility.message.unread");

    return I18n.t("messages.accessibility.message.description", {
      newMessage,
      organizationName: message.organizationName,
      serviceName: message.serviceName,
      subject: message.content.subject,
      receivedAt: convertReceivedDateToAccessible(message.created_at)
    });
  };

  public render() {
    const {
      isRead,
      message,
      service,
      payment,
      isSelectionModeEnabled,
      isSelected
    } = this.props;

    const uiService = fromNullable(service).fold(UNKNOWN_SERVICE_DATA, _ => ({
      organizationName: _.organization_name,
      serviceName: _.service_name
    }));

    const uiDate = convertDateToWordDistance(
      message.created_at,
      I18n.t("messages.yesterday")
    );

    return (
      <DetailedlistItemComponent
        isNew={!isRead}
        onPressItem={this.handlePress}
        text11={uiService.organizationName}
        text12={uiDate}
        text2={uiService.serviceName}
        text3={message.content.subject}
        onLongPressItem={this.handleLongPress}
        isSelectionModeEnabled={isSelectionModeEnabled}
        isItemSelected={isSelected}
        accessible={true}
        accessibilityLabel={this.announceMessage({
          isRead,
          ...message,
          ...uiService
        })}
      >
        {!hasPrescriptionData(message) && messageNeedsCTABar(message) && (
          <React.Fragment>
            <View spacer={true} large={true} />
            <MessageListCTABar
              message={message}
              service={service}
              payment={payment}
              disabled={isSelectionModeEnabled}
            />
          </React.Fragment>
        )}
      </DetailedlistItemComponent>
    );
  }
}

export default MessageListItem;
