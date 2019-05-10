import { Option } from "fp-ts/lib/Option";
import I18n from "i18n-js";
import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import React from "react";
import {
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  StyleSheet
} from "react-native";
import Placeholder from "rn-placeholder";

import { CreatedMessageWithContent } from "../../../definitions/backend/CreatedMessageWithContent";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { MessageState } from "../../store/reducers/entities/messages/messagesById";
import { PaymentByRptIdState } from "../../store/reducers/entities/payments";
import { ServicesByIdState } from "../../store/reducers/entities/services/servicesById";
import customVariables from "../../theme/variables";
import { toMessageWithContentPO } from "../../types/MessageWithContentPO";
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

const ITEM_WITHOUT_CTABAR_HEIGHT = 114;
const ITEM_LOADING_HEIGHT = ITEM_WITHOUT_CTABAR_HEIGHT;
const ITEM_WITH_CTABAR_HEIGHT = 158;
const ITEM_SEPARATOR_HEIGHT = 1;

const styles = StyleSheet.create({
  itemLoadingContainer: {
    height: ITEM_LOADING_HEIGHT,
    paddingVertical: 16,
    paddingHorizontal: customVariables.contentPadding,
    flex: 1
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
  },

  itemLoadingHeaderWrapper: {
    flexDirection: "row",
    marginBottom: 4
  },

  itemLoadingHeaderCenter: {
    flex: 1,
    paddingRight: 55 // Includes right header space
  },

  itemLoadingContentWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 42
  },

  itemLoadingContentCenter: {
    flex: 1,
    paddingRight: 32
  }
});

const keyExtractor = (_: MessageState) => _.meta.id;

const getItemHeight = (messageState: MessageState): number => {
  const message = messageState.message;

  if (pot.isLoading(message)) {
    return ITEM_LOADING_HEIGHT;
  }

  return pot.isSome(message) && messageNeedsCTABar(message.value)
    ? ITEM_WITH_CTABAR_HEIGHT
    : ITEM_WITHOUT_CTABAR_HEIGHT;
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
  <View style={[styles.itemLoadingContainer]}>
    <View style={styles.itemLoadingHeaderWrapper}>
      <View style={styles.itemLoadingHeaderCenter}>
        <Placeholder.Paragraph
          textSize={customVariables.fontSizeBase}
          color={customVariables.shineColor}
          lineNumber={2}
          lineSpacing={5}
          width="100%"
          firstLineWidth="100%"
          lastLineWidth="55%"
          animate="shine"
          onReady={false}
        />
      </View>
    </View>

    <View style={styles.itemLoadingContentWrapper}>
      <View style={styles.itemLoadingContentCenter}>
        <Placeholder.Line
          textSize={customVariables.fontSizeBase}
          color={customVariables.shineColor}
          width="75%"
          animate="shine"
        />
      </View>
    </View>
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

    if (
      potService &&
      (pot.isLoading(potService) || pot.isLoading(potMessage))
    ) {
      return MessageListItemPlaceholder;
    }

    // Error messages have the same charateristics of normal messages.
    // The idea is to fill data with error strings to have it printed as shown
    // in mockups.
    const message = pot.isNone(potMessage)
      ? toMessageWithContentPO({
          ...meta,
          created_at: new Date(meta.created_at),
          content: { subject: I18n.t("messages.errorLoading.details") }
          // CreatedMessageWithContent cast is needed because of the lack of
          // "markdown" required property. It is not passed because it's not
          // needed for giving feedback in the messsage list
        } as CreatedMessageWithContent)
      : potMessage.value;

    const service =
      potService !== undefined
        ? pot.isNone(potService)
          ? ({
              organization_name: I18n.t("messages.errorLoading.senderService"),
              department_name: I18n.t("messages.errorLoading.senderInfo")
            } as ServicePublic)
          : pot.toUndefined(potService)
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
