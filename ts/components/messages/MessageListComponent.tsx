import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { FlatList, ListRenderItemInfo, RefreshControl } from "react-native";

import {
  MessagesUIStatesByIdState,
  withDefaultMessageUIStates
} from "../../store/reducers/entities/messages/messagesUIStatesById";
import { PaymentByRptIdState } from "../../store/reducers/entities/payments";
import { ServicesByIdState } from "../../store/reducers/entities/services/servicesById";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";
import { MessageListItemComponent } from "./MessageListItemComponent";

type MessageWithId = {
  messageId: string;
  message: pot.Pot<MessageWithContentPO, string>;
};

type OwnProps = {
  messages: ReadonlyArray<MessageWithId>;
  messagesUIStatesById: MessagesUIStatesByIdState;
  servicesById: ServicesByIdState;
  paymentByRptId: PaymentByRptIdState;
  refreshing: boolean;
  onRefresh: () => void;
  onListItemPress?: (messageId: string) => void;
};

type Props = OwnProps;

const keyExtractor = (_: MessageWithId) => _.messageId;

class MessageListComponent extends React.Component<Props> {
  private renderItem = (info: ListRenderItemInfo<MessageWithId>) => {
    const { messageId, message } = info.item;

    const messageUIStates = withDefaultMessageUIStates(
      this.props.messagesUIStatesById[messageId]
    );
    const service = pot.getOrElse(
      pot.map(message, m => this.props.servicesById[m.sender_service_id]),
      pot.none
    );

    return (
      <MessageListItemComponent
        messageId={messageId}
        message={message}
        paymentByRptId={this.props.paymentByRptId}
        messageUIStates={messageUIStates}
        service={service !== undefined ? service : pot.none}
        onItemPress={this.props.onListItemPress}
      />
    );
  };

  public render() {
    const {
      messages,
      messagesUIStatesById,
      servicesById,
      refreshing,
      onRefresh,
      paymentByRptId
    } = this.props;

    const refreshControl = (
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    );

    return (
      <FlatList
        scrollEnabled={true}
        data={messages}
        extraData={{ servicesById, messagesUIStatesById, paymentByRptId }}
        keyExtractor={keyExtractor}
        renderItem={this.renderItem}
        refreshControl={refreshControl}
      />
    );
  }
}

export default MessageListComponent;
