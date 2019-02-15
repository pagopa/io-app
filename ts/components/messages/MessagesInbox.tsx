import * as pot from "italia-ts-commons/lib/pot";
import { Button, Text, View } from "native-base";
import React, { ComponentProps } from "react";
import { StyleSheet } from "react-native";

import I18n from "../../i18n";
import { lexicallyOrderedMessagesStateInfoSelector } from "../../store/reducers/entities/messages";
import { MessageState } from "../../store/reducers/entities/messages/messagesById";
import {
  InjectedWithMessagesSelectionProps,
  withMessagesSelection
} from "../helpers/withMessagesSelection";
import MessageListComponent from "./MessageListComponent";

const styles = StyleSheet.create({
  listWrapper: {
    flex: 1
  },

  buttonBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    zIndex: 1,
    justifyContent: "space-around",
    backgroundColor: "#ddd",
    padding: 10,
    opacity: 0.75
  },
  buttonBarButton: {
    opacity: 1
  }
});

type OwnProps = {
  messagesStateInfo: ReturnType<
    typeof lexicallyOrderedMessagesStateInfoSelector
  >;
  navigateToMessageDetail: (id: string) => void;
  setMessagesArchivedState: (
    ids: ReadonlyArray<string>,
    archived: boolean
  ) => void;
};

type Props = Pick<
  ComponentProps<typeof MessageListComponent>,
  "servicesById" | "paymentByRptId" | "onRefresh"
> &
  OwnProps &
  InjectedWithMessagesSelectionProps;

type State = {
  lastMessageStatesUpdate: number;
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

/**
 * A component to render a list of visible (not yet archived) messages.
 * It acts like a wrapper for the MessageListComponent, filtering the messages
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
    const { lastMessageStatesUpdate } = prevState;

    if (lastMessageStatesUpdate !== nextProps.messagesStateInfo.lastUpdate) {
      // The list was updated, we need to re-apply the filter and
      // save the result in the state.
      return {
        filteredMessageStates: generateMessagesStateNotArchivedArray(
          nextProps.messagesStateInfo.potMessagesState
        ),
        lastMessageStatesUpdate: nextProps.messagesStateInfo.lastUpdate
      };
    }

    // The state must not be changed.
    return null;
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      lastMessageStatesUpdate: 0,
      filteredMessageStates: []
    };
  }

  public render() {
    const isLoading = pot.isLoading(
      this.props.messagesStateInfo.potMessagesState
    );
    const { selectedMessageIds, resetSelection } = this.props;

    return (
      <View style={styles.listWrapper}>
        {selectedMessageIds.isSome() && (
          <View style={styles.buttonBar}>
            <Button
              style={styles.buttonBarButton}
              disabled={selectedMessageIds.value.size === 0}
              onPress={this.archiveMessages}
            >
              <Text>{I18n.t("messages.cta.archive")}</Text>
            </Button>
            <Button onPress={resetSelection} style={styles.buttonBarButton}>
              <Text>{I18n.t("global.buttons.cancel")}</Text>
            </Button>
          </View>
        )}
        <MessageListComponent
          {...this.props}
          messages={this.state.filteredMessageStates}
          onPressItem={this.handleOnPressItem}
          onLongPressItem={this.handleOnLongPressItem}
          refreshing={isLoading}
          selectedMessageIds={selectedMessageIds}
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
