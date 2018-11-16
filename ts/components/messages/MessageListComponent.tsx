import { NonEmptyString } from "italia-ts-commons/lib/strings";
import * as React from "react";
import { FlatList, ListRenderItemInfo, RefreshControl } from "react-native";

import {
  MessagesUIStatesByIdState,
  withDefaultMessageUIStates
} from "../../store/reducers/entities/messages/messagesUIStatesById";
import { ServicesByIdState } from "../../store/reducers/entities/services/servicesById";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";
import * as pot from "../../types/pot";
import { MessageListItemComponent } from "./MessageListItemComponent";

type OwnProps = {
  messages: ReadonlyArray<MessageWithContentPO>;
  messagesUIStatesById: MessagesUIStatesByIdState;
  servicesById: ServicesByIdState;
  refreshing: boolean;
  onRefresh: () => void;
  onListItemPress?: (messageId: NonEmptyString) => void;
};

type Props = OwnProps;

const keyExtractor = (message: MessageWithContentPO) => message.id;

class MessageListComponent extends React.PureComponent<Props> {
  private renderItem = (info: ListRenderItemInfo<MessageWithContentPO>) => {
    const message = info.item;
    const messageUIStates = withDefaultMessageUIStates(
      this.props.messagesUIStatesById[message.id]
    );
    const service = this.props.servicesById[message.sender_service_id];

    return (
      <MessageListItemComponent
        message={message}
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
      onRefresh
    } = this.props;

    const refreshControl = (
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    );

    return (
      <FlatList
        scrollEnabled={true}
        data={messages}
        extraData={{ servicesById, messagesUIStatesById }}
        keyExtractor={keyExtractor}
        renderItem={this.renderItem}
        refreshControl={refreshControl}
      />
    );
  }
}

export default MessageListComponent;
