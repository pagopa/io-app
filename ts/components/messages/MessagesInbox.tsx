import * as pot from "italia-ts-commons/lib/pot";
import { Button, Text, View } from "native-base";
import React, { ComponentProps } from "react";
import { Animated, Image, StyleSheet } from "react-native";

import I18n from "../../i18n";
import { lexicallyOrderedMessagesStateSelector } from "../../store/reducers/entities/messages";
import { MessageState } from "../../store/reducers/entities/messages/messagesById";
import customVariables from "../../theme/variables";
import {
  InjectedWithMessagesSelectionProps,
  withMessagesSelection
} from "../helpers/withMessagesSelection";
import MessageList from "./MessageList";

const styles = StyleSheet.create({
  listWrapper: {
    flex: 1
  },

  buttonBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 72,
    flexDirection: "row",
    zIndex: 1,
    justifyContent: "space-around",
    backgroundColor: customVariables.brandLightGray,
    padding: 10
  },
  buttonBarPrimaryButton: {
    flex: 8,
    marginLeft: 10
  },
  buttonBarSecondaryButton: {
    flex: 4
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
  // paddingForAnimation has value equal to screen header. It is necessary
  // because header has absolute position
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
  InjectedWithMessagesSelectionProps;

type State = {
  lastMessagesState: ReturnType<typeof lexicallyOrderedMessagesStateSelector>;
  filteredMessageStates: ReturnType<
    typeof generateMessagesStateNotArchivedArray
  >;
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
      return {
        filteredMessageStates: generateMessagesStateNotArchivedArray(
          nextProps.messagesState
        ),
        lastMessagesState: nextProps.messagesState
      };
    }

    // The state must not be changed.
    return null;
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      lastMessagesState: pot.none,
      filteredMessageStates: []
    };
  }

  public render() {
    const isLoading = pot.isLoading(this.props.messagesState);
    const {
      animated,
      AnimatedCTAStyle,
      selectedMessageIds,
      resetSelection
    } = this.props;

    return (
      <View style={styles.listWrapper}>
        {selectedMessageIds.isSome() && (
          <Animated.View style={[styles.buttonBar, AnimatedCTAStyle]}>
            <Button
              block={true}
              bordered={true}
              light={true}
              onPress={resetSelection}
              style={styles.buttonBarSecondaryButton}
            >
              <Text>{I18n.t("global.buttons.cancel")}</Text>
            </Button>
            <Button
              block={true}
              style={styles.buttonBarPrimaryButton}
              disabled={selectedMessageIds.value.size === 0}
              onPress={this.archiveMessages}
            >
              <Text>{I18n.t("messages.cta.archive")}</Text>
            </Button>
          </Animated.View>
        )}
        <MessageList
          {...this.props}
          messageStates={this.state.filteredMessageStates}
          onPressItem={this.handleOnPressItem}
          onLongPressItem={this.handleOnLongPressItem}
          refreshing={isLoading}
          selectedMessageIds={selectedMessageIds}
          ListEmptyComponent={ListEmptyComponent}
          animated={animated}
        />
      </View>
    );
  }

  private handleOnPressItem = (id: string) => {
    if (this.props.selectedMessageIds.isSome()) {
      // Is the selection mode is active a simple "press" must act as
      // a "longPress" (select the item).
      this.handleOnLongPressItem(id);
    } else {
      this.props.navigateToMessageDetail(id);
    }
  };

  private handleOnLongPressItem = (id: string) => {
    this.props.toggleMessageSelection(id);
  };

  private archiveMessages = () => {
    this.props.resetSelection();
    this.props.setMessagesArchivedState(
      this.props.selectedMessageIds.map(_ => Array.from(_)).getOrElse([]),
      true
    );
  };
}

export default withMessagesSelection(MessagesInbox);
