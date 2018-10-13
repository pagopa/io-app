import * as React from "react";
import { FlatList, ListRenderItemInfo, RefreshControl } from "react-native";

import { ServicesByIdState } from "../../store/reducers/entities/services/servicesById";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";
import { MessageListItemComponent } from "./MessageListItemComponent";

type OwnProps = {
  messages: ReadonlyArray<MessageWithContentPO>;
  servicesById: ServicesByIdState;
  refreshing: boolean;
  onRefresh: () => void;
  onListItemPress?: (messageId: string) => void;
};

type Props = OwnProps;

const makeRenderItem = (
  servicesById: ServicesByIdState,
  onListItemPress?: (messageId: string) => void
) => (info: ListRenderItemInfo<MessageWithContentPO>) => {
  const message = info.item;
  const service = servicesById[message.sender_service_id];

  return (
    <MessageListItemComponent
      message={message}
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
        renderItem={makeRenderItem(servicesById, onListItemPress)}
        refreshControl={refreshControl}
      />
    );
  }
}

export default MessageListComponent;
