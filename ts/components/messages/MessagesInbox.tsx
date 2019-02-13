import * as pot from "italia-ts-commons/lib/pot";
import { Button, Text, View } from "native-base";
import React, { ComponentProps } from "react";
import { StyleSheet } from "react-native";

import I18n from "../../i18n";
import { lexicallyOrderedMessagesStateInfoSelector } from "../../store/reducers/entities/messages";
import { MessageState } from "../../store/reducers/entities/messages/messagesById";
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
  OwnProps;

type State = {
  lastMessageStatesUpdate: number;
  filteredMessageStates: ReturnType<typeof generateFilteredMessagesState>;
  isSelectionModeEnabled: boolean;
  selectedMessageIds: Map<string, true>;
};

const generateFilteredMessagesState = (
  potMessagesState: pot.Pot<ReadonlyArray<MessageState>, string>
): ReadonlyArray<MessageState> =>
  pot.getOrElse(
    pot.map(potMessagesState, _ =>
      _.filter(messageState => !messageState.isArchived)
    ),
    []
  );

class MessagesInbox extends React.PureComponent<Props, State> {
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
      filteredMessageStates: [],
      isSelectionModeEnabled: false,
      selectedMessageIds: new Map()
    };
  }

  public render() {
    const isLoading = pot.isLoading(
      this.props.messagesStateInfo.potMessagesState
    );
    const { isSelectionModeEnabled, selectedMessageIds } = this.state;

    return (
      <View style={styles.listWrapper}>
        {this.state.isSelectionModeEnabled && (
          <View style={styles.buttonBar}>
            <Button
              onPress={this.archiveMessages}
              style={styles.buttonBarButton}
              disabled={this.state.selectedMessageIds.size === 0}
            >
              <Text>{I18n.t("messages.cta.archive")}</Text>
            </Button>
            <Button
              onPress={this.resetSelection}
              style={styles.buttonBarButton}
            >
              <Text>{I18n.t("global.buttons.cancel")}</Text>
            </Button>
          </View>
        )}
        <MessageListComponent
          {...this.props}
          messages={this.state.filteredMessageStates}
          refreshing={isLoading}
          onPressItem={this.handleOnPressItem}
          onLongPressItem={this.handleOnLongPressItem}
          isSelectionModeEnabled={isSelectionModeEnabled}
          selectedMessageIds={selectedMessageIds}
        />
      </View>
    );
  }

  private handleOnPressItem = (id: string) => {
    if (this.state.isSelectionModeEnabled) {
      this.handleOnLongPressItem(id);
    } else {
      this.props.navigateToMessageDetail(id);
    }
  };

  private handleOnLongPressItem = (id: string) => {
    this.setState(prevState => {
      const selectedMessageIds = new Map(prevState.selectedMessageIds);
      selectedMessageIds.get(id)
        ? selectedMessageIds.delete(id)
        : selectedMessageIds.set(id, true);
      return { isSelectionModeEnabled: true, selectedMessageIds };
    });
  };

  private archiveMessages = () => {
    this.resetSelection();
    this.props.setMessagesArchivedState(
      Array.from(this.state.selectedMessageIds.keys()),
      true
    );
  };

  private resetSelection = () => {
    this.setState({
      isSelectionModeEnabled: false,
      selectedMessageIds: new Map()
    });
  };
}

export default MessagesInbox;
