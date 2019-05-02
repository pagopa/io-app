import { Option } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Text, View } from "native-base";
import React from "react";
import {
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  StyleSheet
} from "react-native";
import Placeholder from "rn-placeholder";

import { MessageState } from "../../store/reducers/entities/messages/messagesById";
import { PaymentByRptIdState } from "../../store/reducers/entities/payments";
import { ServicesByIdState } from "../../store/reducers/entities/services/servicesById";
import customVariables from "../../theme/variables";
import { messageNeedsCTABar } from "../../utils/messages";
import MessageListItem from "./MessageListItem";

type ItemLayout = {
  length: number;
  offset: number;
  index: number;
};

type OwnProps = {
  messageStates: ReadonlyArray<MessageState>;
  servicesById: ServicesByIdState;
  paymentsByRptId: PaymentByRptIdState;
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

type State = {
  prevMessageStates?: ReadonlyArray<MessageState>;
  itemLayouts: ReadonlyArray<ItemLayout>;
};

const ITEM_LOADING_HEIGHT = 90;
const ITEM_ERROR_HEIGHT = 56;
const ITEM_WITHOUT_CTABAR_HEIGHT = 114;
const ITEM_WITH_CTABAR_HEIGHT = 158;
const ITEM_SEPARATOR_HEIGHT = 1;

const styles = StyleSheet.create({
  itemLoadingContainer: {
    height: ITEM_LOADING_HEIGHT,
    paddingVertical: 16,
    paddingHorizontal: customVariables.contentPadding
  },

  itemErrorContainer: {
    height: ITEM_ERROR_HEIGHT,
    paddingVertical: 16,
    paddingHorizontal: customVariables.contentPadding
  },

  itemWithoutCTABarContainer: {
    display: "flex",
    flex: 1,
    height: ITEM_WITHOUT_CTABAR_HEIGHT
  },

  itemWithCTABarContainer: {
    display: "flex",
    flex: 1,
    height: ITEM_WITH_CTABAR_HEIGHT
  },

  itemSeparator: {
    height: 1,
    backgroundColor: customVariables.brandLightGray
  }
});

const keyExtractor = (_: MessageState) => _.meta.id;

const getItemHeight = (messageState: MessageState): number => {
  const message = messageState.message;

  if (pot.isLoading(message)) {
    return ITEM_LOADING_HEIGHT;
  }

  if (pot.isSome(message)) {
    return messageNeedsCTABar(message.value)
      ? ITEM_WITH_CTABAR_HEIGHT
      : ITEM_WITHOUT_CTABAR_HEIGHT;
  }

  return ITEM_ERROR_HEIGHT;
};

const generateItemLayouts = (messageStates: ReadonlyArray<MessageState>) => {
  // tslint:disable-next-line: no-let
  let offset = 0;
  // tslint:disable-next-line: readonly-array
  const itemLayouts: ItemLayout[] = [];

  messageStates.forEach((messageState, index) => {
    const itemHeight = getItemHeight(messageState);

    const itemHeightWithSeparator =
      index === messageStates.length - 1
        ? itemHeight
        : itemHeight + ITEM_SEPARATOR_HEIGHT;

    itemLayouts.push({
      length: itemHeightWithSeparator,
      offset,
      index
    });

    offset += itemHeightWithSeparator;
  });

  return itemLayouts;
};

const MessageListItemPlaceholder = (
  <View style={styles.itemLoadingContainer}>
    <Placeholder.Paragraph
      textSize={customVariables.fontSizeBase}
      color={customVariables.shineColor}
      lineNumber={3}
      lineSpacing={5}
      width="100%"
      firstLineWidth="100%"
      lastLineWidth="75%"
      onReady={false}
    />
  </View>
);

const MessageListItemError = (
  <View style={styles.itemErrorContainer}>
    <Text numberOfLines={1}>Error loading the message detail.</Text>
  </View>
);

const ItemSeparatorComponent = () => <View style={styles.itemSeparator} />;

class MessageList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      itemLayouts: []
    };
  }

  public static getDerivedStateFromProps(
    nextProps: Props,
    prevState: State
  ): Partial<State> | null {
    const { messageStates } = nextProps;
    const { prevMessageStates: prevMessages } = prevState;

    if (messageStates !== prevMessages) {
      return {
        prevMessageStates: messageStates,
        itemLayouts: generateItemLayouts(messageStates)
      };
    }

    return null;
  }

  private renderItem = (info: ListRenderItemInfo<MessageState>) => {
    const { meta, isRead, message: potMessage } = info.item;
    const { paymentsByRptId, onPressItem, onLongPressItem } = this.props;

    const potService = this.props.servicesById[meta.sender_service_id];

    if (info.index === 0) {
      return MessageListItemPlaceholder;
    }

    if (info.index === 1) {
      return MessageListItemError;
    }

    if (
      potService &&
      (pot.isLoading(potService) || pot.isLoading(potMessage))
    ) {
      return MessageListItemPlaceholder;
    }

    if (pot.isNone(potMessage)) {
      return MessageListItemError;
    }

    const message = potMessage.value;

    const service =
      potService !== undefined ? pot.toUndefined(potService) : undefined;

    const payment =
      message.content.payment_data !== undefined && service !== undefined
        ? paymentsByRptId[
            `${service.organization_fiscal_code}${
              message.content.payment_data.notice_number
            }`
          ]
        : undefined;

    return (
      <View
        style={
          messageNeedsCTABar(message)
            ? styles.itemWithCTABarContainer
            : styles.itemWithoutCTABarContainer
        }
      >
        <MessageListItem
          isRead={isRead}
          message={message}
          service={service}
          payment={payment}
          onPress={onPressItem}
          onLongPress={onLongPressItem}
          isSelectionModeEnabled={this.props.selectedMessageIds.isSome()}
          isSelected={this.props.selectedMessageIds
            .map(_ => _.has(info.item.meta.id))
            .getOrElse(false)}
        />
      </View>
    );
  };

  private getItemLayout = (
    _: ReadonlyArray<MessageState> | null,
    index: number
  ) => {
    return this.state.itemLayouts[index];
  };

  public render() {
    const {
      messageStates,
      servicesById,
      refreshing,
      onRefresh,
      paymentsByRptId,
      ListEmptyComponent
    } = this.props;

    const refreshControl = (
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    );

    return (
      <FlatList
        scrollEnabled={true}
        data={messageStates}
        extraData={{ servicesById, paymentsByRptId }}
        keyExtractor={keyExtractor}
        refreshControl={refreshControl}
        initialNumToRender={10}
        ItemSeparatorComponent={ItemSeparatorComponent}
        ListEmptyComponent={ListEmptyComponent}
        renderItem={this.renderItem}
        getItemLayout={this.getItemLayout}
      />
    );
  }
}

export default MessageList;
