import { fromNullable, none, Option } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import memoizeOne from "memoize-one";
import React from "react";
import { FlatList, ListRenderItemInfo, RefreshControl } from "react-native";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { MessageState } from "../../store/reducers/entities/messages/messagesById";
import { PaymentByRptIdState } from "../../store/reducers/entities/payments";
import { ServicesByIdState } from "../../store/reducers/entities/services/servicesById";
import { messageNeedsCTABar } from "../../utils/messages";
import MessageListItem from "./MessageListItem";
import MessageListItemError from "./MessageListItemError";
import MessageListItemPlaceholder from "./MessageListItemPlaceholder";
import console = require("console");

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
const ITEM_ERROR_HEIGHT = 80;
const ITEM_WITHOUT_CTABAR_HEIGHT = 114;
const ITEM_WITH_CTABAR_HEIGHT = 158;

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

    itemLayouts.push({
      length: itemHeight,
      offset,
      index
    });

    offset += itemHeight;
  });

  return itemLayouts;
};

const maybeServiceMemoized = memoizeOne(
  (potService: pot.Pot<ServicePublic, Error> | undefined) =>
    fromNullable(potService).chain(pot.toOption)
);

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

  private maybeServiceMemoized = memoizeOne(
    (potService: pot.Pot<ServicePublic, Error> | undefined) => {
      console.log("No memoization");
      return fromNullable(potService).chain(pot.toOption);
    }
  );

  private renderItem = (info: ListRenderItemInfo<MessageState>) => {
    const { meta, message: potMessage } = info.item;
    const { paymentsByRptId, onPressItem, onLongPressItem } = this.props;

    const potService = this.props.servicesById[meta.sender_service_id];

    if (
      potService &&
      (pot.isLoading(potService) || pot.isLoading(potMessage))
    ) {
      return <MessageListItemPlaceholder />;
    }

    if (pot.isNone(potMessage)) {
      return <MessageListItemError />;
    }
    const message = potMessage.value;

    const maybeService = this.maybeServiceMemoized(potService);

    const service =
      potService !== undefined
        ? pot.getOrElse(potService, undefined)
        : undefined;

    const payment =
      message.content.payment_data !== undefined && service !== undefined
        ? paymentsByRptId[
            `${service.organization_fiscal_code}${
              message.content.payment_data.notice_number
            }`
          ]
        : undefined;

    return (
      <MessageListItem
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
        data={messageStates.slice(1, 10)}
        extraData={{ servicesById, paymentsByRptId }}
        keyExtractor={keyExtractor}
        refreshControl={refreshControl}
        initialNumToRender={10}
        ListEmptyComponent={ListEmptyComponent}
        renderItem={this.renderItem}
        getItemLayout={this.getItemLayout}
      />
    );
  }
}

export default MessageList;
