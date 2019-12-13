import { none, Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Text, View } from "native-base";
import React, { ComponentProps } from "react";
import { Image, StyleSheet } from "react-native";
import I18n from "../../i18n";
import { lexicallyOrderedMessagesStateSelector } from "../../store/reducers/entities/messages";
import { MessageState } from "../../store/reducers/entities/messages/messagesById";
import customVariables from "../../theme/variables";
import { HEADER_HEIGHT } from "../../utils/constants";
import {
  InjectedWithItemsSelectionProps,
  withItemsSelection
} from "../helpers/withItemsSelection";
import { ListSelectionBar } from "../ListSelectionBar";
import MessageList from "./MessageList";

const SCROLL_RANGE_FOR_ANIMATION = HEADER_HEIGHT;

const styles = StyleSheet.create({
  listWrapper: {
    flex: 1
  },
  animatedStartPosition: {
    bottom: SCROLL_RANGE_FOR_ANIMATION
  },
  emptyListWrapper: {
    padding: customVariables.contentPadding,
    alignItems: "center"
  },
  emptyListContentTitle: {
    paddingTop: customVariables.contentPadding
  },
  emptyListContentSubtitle: {
    textAlign: "center",
    paddingTop: customVariables.contentPadding,
    fontSize: customVariables.fontSizeSmall
  },
  paddingForAnimation: {
    height: 55
  },
  listContainer: {
    flex: 1
  }
});

type OwnProps = {
  messagesState: ReturnType<typeof lexicallyOrderedMessagesStateSelector>;
  navigateToMessageDetail: (id: string) => void;
  setMessagesArchivedState: (
    ids: ReadonlyArray<string>,
    archived: boolean
  ) => void;
};

type AnimationProps = {
  // paddingForAnimation flag is set to true when this component is animated.
  // It is used to make empty list component and command bar correctly visible
  // when scroll is below animation threshold.
  paddingForAnimation: boolean;
  AnimatedCTAStyle?: any;
};

type MessageListProps =
  | "servicesById"
  | "paymentsByRptId"
  | "onRefresh"
  | "animated";

type Props = Pick<ComponentProps<typeof MessageList>, MessageListProps> &
  OwnProps &
  AnimationProps &
  InjectedWithItemsSelectionProps;

type State = {
  lastMessagesState: ReturnType<typeof lexicallyOrderedMessagesStateSelector>;
  filteredMessageStates: ReturnType<
    typeof generateMessagesStateNotArchivedArray
  >;
  allMessageIdsState: Option<Set<string>>;
};

/**
 * Filter only the messages that are not archived.
 */
const generateMessagesStateNotArchivedArray = (
  potMessagesState: pot.Pot<ReadonlyArray<MessageState>, string>
): ReadonlyArray<MessageState> =>
  pot.getOrElse(
    pot.map(potMessagesState, _ =>
      _.filter(messageState => !messageState.isArchived)
    ),
    []
  );

const ListEmptyComponent = (paddingForAnimation: boolean) => (
  <View style={styles.emptyListWrapper}>
    <View spacer={true} />
    <Image
      source={require("../../../img/messages/empty-message-list-icon.png")}
    />
    <Text style={styles.emptyListContentTitle}>
      {I18n.t("messages.inbox.emptyMessage.title")}
    </Text>
    <Text style={styles.emptyListContentSubtitle}>
      {I18n.t("messages.inbox.emptyMessage.subtitle")}
    </Text>
    {paddingForAnimation && <View style={styles.paddingForAnimation} />}
  </View>
);

/**
 * A component to render a list of visible (not yet archived) messages.
 * It acts like a wrapper for the MessageList component, filtering the messages
 * and adding the messages selection and archiving management.
 */
class MessagesInbox extends React.PureComponent<Props, State> {
  /**
   * Updates the filteredMessageStates only when necessary.
   */
  public static getDerivedStateFromProps(
    nextProps: Props,
    prevState: State
  ): Partial<State> | null {
    const { lastMessagesState } = prevState;

    if (lastMessagesState !== nextProps.messagesState) {
      // The list was updated, we need to re-apply the filter and
      // save the result in the state.
      const messagesStateNotArchived = generateMessagesStateNotArchivedArray(
        nextProps.messagesState
      );
      const allMessagesIdsArray = messagesStateNotArchived.map(_ => _.meta.id);
      return {
        filteredMessageStates: messagesStateNotArchived,
        lastMessagesState: nextProps.messagesState,
        allMessageIdsState: some(new Set(allMessagesIdsArray))
      };
    }

    // The state must not be changed.
    return null;
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      lastMessagesState: pot.none,
      filteredMessageStates: [],
      allMessageIdsState: none
    };
  }

  public render() {
    const isLoading = pot.isLoading(this.props.messagesState);
    const {
      animated,
      AnimatedCTAStyle,
      paddingForAnimation,
      selectedItemIds,
      resetSelection
    } = this.props;
    const { allMessageIdsState } = this.state;
    const isErrorLoading = pot.isError(this.props.messagesState);

    // If have error in pot and the list is empty
    const ErrorLoadingComponent = () => (
      <View style={styles.emptyListWrapper}>
        <View spacer={true} />
        <Image
          source={require("../../../img/messages/empty-message-list-icon.png")}
        />
        <Text style={styles.emptyListContentTitle}>
          {I18n.t("messages.loadingErrorTitle")}
        </Text>
        {paddingForAnimation && <View style={styles.paddingForAnimation} />}
      </View>
    );

    return (
      <View style={styles.listWrapper}>
        <View style={styles.listContainer}>
          <MessageList
            {...this.props}
            messageStates={this.state.filteredMessageStates}
            onPressItem={this.handleOnPressItem}
            onLongPressItem={this.handleOnLongPressItem}
            refreshing={isLoading}
            selectedMessageIds={selectedItemIds}
            ListEmptyComponent={
              isErrorLoading ? ErrorLoadingComponent : ListEmptyComponent
            }
            animated={animated}
          />
        </View>
        <ListSelectionBar
          selectedItemIds={selectedItemIds}
          allItemIds={allMessageIdsState}
          onToggleSelection={this.archiveMessages}
          onToggleAllSelection={this.toggleAllMessagesSelection}
          onResetSelection={resetSelection}
          primaryButtonText={I18n.t("messages.cta.archive")}
          containerStyle={[
            AnimatedCTAStyle,
            paddingForAnimation && styles.animatedStartPosition
          ]}
        />
      </View>
    );
  }

  private handleOnPressItem = (id: string) => {
    if (this.props.selectedItemIds.isSome()) {
      // Is the selection mode is active a simple "press" must act as
      // a "longPress" (select the item).
      this.handleOnLongPressItem(id);
    } else {
      this.props.navigateToMessageDetail(id);
    }
  };

  private handleOnLongPressItem = (id: string) => {
    this.props.toggleItemSelection(id);
  };

  private toggleAllMessagesSelection = () => {
    const { allMessageIdsState } = this.state;
    const { selectedItemIds } = this.props;
    if (allMessageIdsState.isSome() && selectedItemIds.isSome()) {
      this.props.setSelectedItemIds(
        allMessageIdsState.value.size === selectedItemIds.value.size
          ? some(new Set())
          : allMessageIdsState
      );
    }
  };

  private archiveMessages = () => {
    this.props.resetSelection();
    this.props.setMessagesArchivedState(
      this.props.selectedItemIds.map(_ => Array.from(_)).getOrElse([]),
      true
    );
  };
}

export default withItemsSelection(MessagesInbox);
