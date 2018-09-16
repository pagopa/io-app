import * as React from "react";
import { FlatList, ListRenderItemInfo, RefreshControl } from "react-native";

import { ServicesByIdState } from "../../store/reducers/entities/services/servicesById";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";
import { MessageListItemComponent } from "./MessageListItemComponent";

export type OwnProps = {
  messages: ReadonlyArray<MessageWithContentPO>;
  servicesById: ServicesByIdState;
  refreshing: boolean;
  onRefresh: () => void;
  onListItemPress?: (messageId: string) => void;
};

export type Props = OwnProps;

export class MessageListComponent extends React.PureComponent<Props, never> {
  private makeRenderItem = (
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

  private keyExtractor = (message: MessageWithContentPO) => message.id;

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
        keyExtractor={this.keyExtractor}
        renderItem={this.makeRenderItem(servicesById, onListItemPress)}
        refreshControl={refreshControl}
      />
    );
  }
}

export default MessageListComponent;
