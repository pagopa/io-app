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
  filteredMessageStates: ReturnType<typeof generateFilteredMessagesState>;
};

/**
 * Filter only the messages that are not archived.
 */
const generateFilteredMessagesState = (
  potMessagesState: pot.Pot<ReadonlyArray<MessageState>, string>
): ReadonlyArray<MessageState> =>
  pot.getOrElse(
    pot.map(potMessagesState, _ =>
      _.filter(messageState => messageState.isArchived)
    ),
    []
  );

/**
 * A component to render a list of archived messages.
 * It acts like a wrapper for the MessageListComponent, filtering the messages
 * and adding the messages selection and archiving management.
 */
class MessagesArchive extends React.PureComponent<Props, State> {
  /**
   * The function is used to update the filteredMessageStates only when necessary.
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
        filteredMessageStates: generateFilteredMessagesState(
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
    const {
      isSelectionModeEnabled,
      selectedMessageIds,
      resetSelection
    } = this.props;

    return (
      <View style={styles.listWrapper}>
        {isSelectionModeEnabled && (
          <View style={styles.buttonBar}>
            <Button
              style={styles.buttonBarButton}
              disabled={selectedMessageIds.size === 0}
              onPress={this.unarchiveMessages}
            >
              <Text>{I18n.t("messages.cta.unarchive")}</Text>
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
          isSelectionModeEnabled={isSelectionModeEnabled}
          selectedMessageIds={selectedMessageIds}
        />
      </View>
    );
  }

  private handleOnPressItem = (id: string) => {
    if (this.props.isSelectionModeEnabled) {
      this.handleOnLongPressItem(id);
    } else {
      this.props.navigateToMessageDetail(id);
    }
  };

  private handleOnLongPressItem = (id: string) => {
    this.props.toggleMessageSelection(id);
  };

  private unarchiveMessages = () => {
    this.props.resetSelection();
    this.props.setMessagesArchivedState(
      Array.from(this.props.selectedMessageIds.keys()),
      false
    );
  };
}

export default withMessagesSelection(MessagesArchive);
