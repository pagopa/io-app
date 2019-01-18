import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { FlatList, ListRenderItemInfo, RefreshControl } from "react-native";

import { MessageState } from "../../store/reducers/entities/messages/messagesById";
import {
  MessagesUIStatesByIdState,
  withDefaultMessageUIStates
} from "../../store/reducers/entities/messages/messagesUIStatesById";
import { PaymentByRptIdState } from "../../store/reducers/entities/payments";
import { ServicesByIdState } from "../../store/reducers/entities/services/servicesById";
import { MessageListItemComponent } from "./MessageListItemComponent";

type OwnProps = {
  messages: ReadonlyArray<MessageState>;
  messagesUIStatesById: MessagesUIStatesByIdState;
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

    const messageUIStates = withDefaultMessageUIStates(
      this.props.messagesUIStatesById[meta.id]
    );
    const service = this.props.servicesById[meta.sender_service_id];

    return (
      <MessageListItemComponent
        messageState={info.item}
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
