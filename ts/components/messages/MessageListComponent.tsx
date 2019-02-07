import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { FlatList, ListRenderItemInfo, RefreshControl } from "react-native";

import { MessageState } from "../../store/reducers/entities/messages/messagesById";

import { PaymentByRptIdState } from "../../store/reducers/entities/payments";
import { ServicesByIdState } from "../../store/reducers/entities/services/servicesById";
import { MessageListItemComponent } from "./MessageListItemComponent";

type OwnProps = {
  messages: ReadonlyArray<MessageState>;
  servicesById: ServicesByIdState;
  paymentByRptId: PaymentByRptIdState;
  refreshing: boolean;
  onRefresh: () => void;
  onListItemPress?: (messageId: string) => void;
};

type Props = OwnProps;

const keyExtractor = (_: MessageState) => _.meta.id;

class MessageListComponent extends React.Component<Props> {
  private renderItem = (info: ListRenderItemInfo<MessageState>) => {
    const { meta } = info.item;

    const service = this.props.servicesById[meta.sender_service_id];

    return (
      <MessageListItemComponent
        messageState={info.item}
        paymentByRptId={this.props.paymentByRptId}
        service={service !== undefined ? service : pot.none}
        onItemPress={this.props.onListItemPress}
      />
    );
  };

  public render() {
    const {
      messages,
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
        extraData={{ servicesById, paymentByRptId }}
        keyExtractor={keyExtractor}
        renderItem={this.renderItem}
        refreshControl={refreshControl}
      />
    );
  }
}

export default MessageListComponent;
