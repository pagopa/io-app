import { Option } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import {
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  StyleSheet,
  View
} from "react-native";

import { NavigationEvents } from "react-navigation";
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
  onPressItem: (id: string) => void;
  onLongPressItem: (id: string) => void;
  selectedMessageIds: Option<Set<string>>;
  ListEmptyComponent?: React.ComponentProps<
    typeof FlatList
  >["ListEmptyComponent"];
};

type Props = OwnProps;

const styles = StyleSheet.create({
  contentContainerStyle: {
    paddingBottom: 100
  }
});

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
        onPress={this.props.onPressItem}
        onLongPress={this.props.onLongPressItem}
        isSelectionModeEnabled={this.props.selectedMessageIds.isSome()}
        isSelected={this.props.selectedMessageIds
          .map(_ => _.has(info.item.meta.id))
          .getOrElse(false)}
      />
    );
  };

  private FlatListRef = React.createRef<FlatList<MessageState>>();
  private scrollToTop = () => {
    if (
      this.FlatListRef.current &&
      this.FlatListRef.current.props.data &&
      this.FlatListRef.current.props.data.length
    ) {
      this.FlatListRef.current.scrollToIndex({ animated: false, index: 0 });
    }
  };

  public render() {
    const {
      messages,
      servicesById,
      refreshing,
      onRefresh,
      paymentByRptId,
      ListEmptyComponent
    } = this.props;

    const refreshControl = (
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    );

    return (
      <View>
        <NavigationEvents onWillFocus={this.scrollToTop} />
        <FlatList
          contentContainerStyle={styles.contentContainerStyle}
          scrollEnabled={true}
          data={messages}
          extraData={{ servicesById, paymentByRptId }}
          keyExtractor={keyExtractor}
          renderItem={this.renderItem}
          refreshControl={refreshControl}
          ListEmptyComponent={ListEmptyComponent}
          ref={this.FlatListRef}
        />
      </View>
    );
  }
}

export default MessageListComponent;
