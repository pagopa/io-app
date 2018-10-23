import * as React from "react";
import { FlatList, ListRenderItemInfo, RefreshControl } from "react-native";

import {
  MessagesUIStatesByIdState,
  withDefaultMessageUIStates
} from "../../store/reducers/entities/messages/messagesUIStatesById";
import { ServicesByIdState } from "../../store/reducers/entities/services/servicesById";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";
import { MessageListItemComponent } from "./MessageListItemComponent";

type OwnProps = {
  messages: ReadonlyArray<MessageWithContentPO>;
  messagesUIStatesById: MessagesUIStatesByIdState;
  servicesById: ServicesByIdState;
  refreshing: boolean;
  onRefresh: () => void;
  onListItemPress?: (messageId: string) => void;
};

type Props = OwnProps;

const makeRenderItem = (
  messagesUIStatesById: MessagesUIStatesByIdState,
  servicesById: ServicesByIdState,
  onListItemPress?: (messageId: string) => void
) => (info: ListRenderItemInfo<MessageWithContentPO>) => {
  const message = info.item;
  const messageUIStates = withDefaultMessageUIStates(
    messagesUIStatesById[message.id]
  );
  const service = servicesById[message.sender_service_id];

  return (
    <MessageListItemComponent
      message={message}
      messageUIStates={messageUIStates}
      service={service}
      onItemPress={onListItemPress}
    />
  );
};

const keyExtractor = (message: MessageWithContentPO) => message.id;

class MessageListComponent extends React.PureComponent<Props, never> {
  public render() {
    const {
      messages,
      messagesUIStatesById,
      servicesById,
      refreshing,
      onRefresh,
      onListItemPress
    } = this.props;

    const refreshControl = (
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    );

    return (
      <FlatList
        scrollEnabled={true}
        data={messages}
        keyExtractor={keyExtractor}
        renderItem={makeRenderItem(
          messagesUIStatesById,
          servicesById,
          onListItemPress
        )}
        refreshControl={refreshControl}
      />
    );
  }
}

export default MessageListComponent;
