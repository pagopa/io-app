import { none, Option, some } from "fp-ts/lib/Option";
import React from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  RefreshControl,
  StyleSheet,
  Vibration
} from "react-native";
import { NavigationEvents } from "react-navigation";
import { MessageState } from "../../../store/reducers/entities/messages/messagesById";
import customVariables, {
  VIBRATION_LONG_PRESS_DURATION
} from "../../../theme/variables";
import ItemSeparatorComponent from "../../ItemSeparatorComponent";
import { EdgeBorderComponent } from "../../screens/EdgeBorderComponent";
import { UIMessage } from "../../../store/reducers/entities/messages/types";

import MessageListItem from "./MessageListItem";

type ItemLayout = {
  length: number;
  offset: number;
  index: number;
};

export type AnimatedProps = {
  animated?: {
    onScroll: (_: NativeSyntheticEvent<NativeScrollEvent>) => void;
    scrollEventThrottle?: number;
  };
};

type OwnProps = {
  messages: ReadonlyArray<UIMessage>;
  refreshing: boolean;
  onRefresh: () => void;
  onLoadMore?: () => void;
  onPressItem: (id: string) => void;
  onLongPressItem: (id: string) => void;
  selectedMessageIds: Option<Set<string>>;
  ListEmptyComponent?: React.ComponentProps<
    typeof FlatList
  >["ListEmptyComponent"];
};

type Props = OwnProps & AnimatedProps;

type State = {
  prevMessages?: OwnProps["messages"];
  itemLayouts: ReadonlyArray<ItemLayout>;
  longPressedItemIndex: Option<number>;
  isFirstLoad: boolean;
};

const ITEM_WITHOUT_CTABAR_HEIGHT = 114;
const ITEM_LOADING_HEIGHT = ITEM_WITHOUT_CTABAR_HEIGHT;
const ITEM_SEPARATOR_HEIGHT = 1;

const styles = StyleSheet.create({
  itemLoadingContainer: {
    height: ITEM_LOADING_HEIGHT,
    paddingVertical: 16,
    paddingHorizontal: customVariables.contentPadding,
    flex: 1
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
  },
  padded: {
    paddingHorizontal: customVariables.contentPadding
  },
  activityIndicator: {
    padding: 12
  }
});

const generateItemLayouts = (
  messages: OwnProps["messages"]
): Array<ItemLayout> => {
  // eslint-disable-next-line
  let offset = 0;
  // eslint-disable-next-line
  const itemLayouts: ItemLayout[] = [];
  // eslint-disable-next-line functional/no-let
  let itemHeightWithSeparator =
    ITEM_WITHOUT_CTABAR_HEIGHT + ITEM_SEPARATOR_HEIGHT;

  for (
    // eslint-disable-next-line functional/no-let
    let i = 0;
    i < messages.length;
    i += 1, offset += itemHeightWithSeparator
  ) {
    itemHeightWithSeparator =
      i === messages.length - 1
        ? ITEM_WITHOUT_CTABAR_HEIGHT
        : ITEM_WITHOUT_CTABAR_HEIGHT + ITEM_SEPARATOR_HEIGHT;

    // eslint-disable-next-line functional/immutable-data
    itemLayouts.push({
      length: itemHeightWithSeparator,
      offset,
      index: i
    });
  }

  return itemLayouts;
};

const ItemSeparator = () => <ItemSeparatorComponent noPadded={true} />;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

class MessageList extends React.Component<Props, State> {
  private flatListRef = React.createRef<FlatList>();

  private scrollTo = (index: number, animated: boolean = false) => {
    if (this.flatListRef.current && this.props.messages.length > 0) {
      this.flatListRef.current.scrollToIndex({ animated, index });
    }
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      itemLayouts: [],
      longPressedItemIndex: none,
      isFirstLoad: Platform.OS === "ios" // considering firstLoad only when running device is iOS
    };
  }

  public static getDerivedStateFromProps(
    nextProps: Props,
    prevState: State
  ): Partial<State> | null {
    const { messages } = nextProps;
    const { prevMessages } = prevState;

    if (messages !== prevMessages) {
      return {
        prevMessages: messages,
        itemLayouts: generateItemLayouts(messages)
      };
    }

    return null;
  }

  private renderItem = (info: ListRenderItemInfo<UIMessage>) => {
    const message = info.item;
    const isRead = false; // TODO: connect this information

    const { onPressItem } = this.props;

    // TODO: this information may not be available with the new payload
    // const payment =
    //   paymentsByRptId[
    //     `${message.content.payment_data?.payee.fiscal_code}${message.content.payment_data?.notice_number}`
    //   ];

    return (
      <MessageListItem
        isRead={isRead}
        message={message}
        onPress={onPressItem}
        onLongPress={this.onLongPress}
        isSelectionModeEnabled={this.props.selectedMessageIds.isSome()}
        isSelected={this.props.selectedMessageIds
          .map(set => set.has(message.id))
          .getOrElse(false)}
      />
    );
  };

  private getItemLayout = (
    _: ReadonlyArray<MessageState> | null,
    index: number
  ) => this.state.itemLayouts[index];

  private onLongPress = (id: string) => {
    Vibration.vibrate(VIBRATION_LONG_PRESS_DURATION);
    const { messages, onLongPressItem } = this.props;
    onLongPressItem(id);
    const lastIndex = messages.length - 1;
    const lastMessageId = messages[lastIndex].id;
    if (id === lastMessageId) {
      this.setState({
        longPressedItemIndex: some(lastIndex)
      });
    }
  };

  private handleOnLayoutChange = () => {
    const { longPressedItemIndex } = this.state;
    if (longPressedItemIndex.isSome()) {
      this.scrollTo(longPressedItemIndex.value, true);
      this.setState({
        longPressedItemIndex: none
      });
    }
  };

  public render() {
    const {
      animated,
      messages,
      refreshing,
      onRefresh,
      onLoadMore,
      ListEmptyComponent
    } = this.props;

    const refreshControl = (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={() => {
          if (this.state.isFirstLoad) {
            this.setState({ isFirstLoad: false });
          }
          onRefresh();
        }}
      />
    );
    return (
      <React.Fragment>
        <NavigationEvents onWillFocus={() => this.scrollTo(0)} />
        {/* in iOS refresh indicator is shown only when user does pull to refresh on list
          so only for iOS devices the ActivityIndicator is shown in place of RefreshControl
          see https://stackoverflow.com/questions/50307314/react-native-flatlist-refreshing-not-showing-when-its-true-during-first-load
          see https://github.com/facebook/react-native/issues/15892
        */}
        {refreshing && this.state.isFirstLoad && (
          <ActivityIndicator
            animating={true}
            style={styles.activityIndicator}
          />
        )}
        <AnimatedFlatList
          ref={this.flatListRef}
          style={styles.padded}
          scrollEnabled={true}
          data={messages}
          refreshing={refreshing}
          keyExtractor={(message: UIMessage): string => message.id}
          refreshControl={refreshControl}
          initialNumToRender={10}
          scrollEventThrottle={
            animated ? animated.scrollEventThrottle : undefined
          }
          ItemSeparatorComponent={ItemSeparator}
          ListEmptyComponent={ListEmptyComponent}
          renderItem={this.renderItem}
          getItemLayout={this.getItemLayout}
          onScroll={animated ? animated.onScroll : undefined}
          onLayout={this.handleOnLayoutChange}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.2}
          ListFooterComponent={messages.length > 0 && <EdgeBorderComponent />}
        />
      </React.Fragment>
    );
  }
}

export default MessageList;
