import { fromNullable, none } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Button, Text, View } from "native-base";
import React from "react";
import { FlatList, ListRenderItem, StyleSheet } from "react-native";

import I18n from "../../i18n";
import { lexicallyOrderedMessagesStateInfoSelector } from "../../store/reducers/entities/messages";
import { MessageState } from "../../store/reducers/entities/messages/messagesById";
import { paymentsByRptIdSelector } from "../../store/reducers/entities/payments";
import { servicesByIdSelector } from "../../store/reducers/entities/services/servicesById";
import MessagesInboxItem from "./MessagesInboxItem";

export const styles = StyleSheet.create({
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

type Props = {
  messagesStateInfo: ReturnType<
    typeof lexicallyOrderedMessagesStateInfoSelector
  >;
  servicesById: ReturnType<typeof servicesByIdSelector>;
  paymentsByRptId: ReturnType<typeof paymentsByRptIdSelector>;
  refreshMessages: () => void;
  setMessagesArchivedState: (
    ids: ReadonlyArray<string>,
    archived: boolean
  ) => void;
  onPressItem: (id: string) => void;
};

type State = {
  lastMessageStatesUpdate: number;
  filteredMessageStates: ReturnType<typeof generateFilteredMessageStates>;
  isSelectionModeEnabled: boolean;
  selectedMessageIds: Map<string, true>;
};

const inboxItemKeyExtractor = (messageState: MessageState) =>
  messageState.meta.id;

/**
 * Filter only the messages that are not archived.
 * @param potMessageStates
 */
const generateFilteredMessageStates = (
  potMessageStates: pot.Pot<ReadonlyArray<MessageState>, string>
): ReadonlyArray<MessageState> =>
  pot.getOrElse(
    pot.map(potMessageStates, _ =>
      _.filter(messageState => !messageState.isArchived)
    ),
    []
  );

/**
 * A component to render a list of visible (not yet archived) messages.
 * The component allows messages selection and archiving.
 */
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
        filteredMessageStates: generateFilteredMessageStates(
          nextProps.messagesStateInfo.potMessageState
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
    const {
      messagesStateInfo,
      servicesById,
      paymentsByRptId,
      refreshMessages
    } = this.props;
    const { filteredMessageStates } = this.state;
    const isLoading = pot.isLoading(messagesStateInfo.potMessageState);

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
        <FlatList
          data={filteredMessageStates}
          extraData={{ servicesById, paymentsByRptId, state: this.state }}
          renderItem={this.renderItem}
          keyExtractor={inboxItemKeyExtractor}
          refreshing={isLoading}
          onRefresh={refreshMessages}
          removeClippedSubviews={true}
        />
      </View>
    );
  }

  public renderItem: ListRenderItem<MessageState> = info => {
    const { meta } = info.item;
    const { servicesById, paymentsByRptId, onPressItem } = this.props;
    const { isSelectionModeEnabled, selectedMessageIds: selected } = this.state;

    const potService = fromNullable(
      servicesById[meta.sender_service_id]
    ).getOrElse(pot.none);

    // Get the RptId from the payment_data and the service (if available)
    const rptId = pot.getOrElse(
      pot.map(info.item.message, message =>
        fromNullable(message.content.payment_data)
          .map(pd =>
            pot.getOrElse(
              pot.map(
                potService,
                s => `${s.organization_fiscal_code}${pd.notice_number}`
              ),
              undefined
            )
          )
          .getOrElse(undefined)
      ),
      undefined
    );

    // Get the payment state from the redux store
    const maybePaidReason =
      rptId !== undefined ? fromNullable(paymentsByRptId[rptId]) : none;

    const itemProps = {
      messageState: info.item,
      potService,
      maybePaidReason,
      isSelectionModeEnabled,
      isSelected: !!selected.get(info.item.meta.id),
      onPress: onPressItem,
      onLongPress: this.handleOnLongPressItem
    };

    return <MessagesInboxItem {...itemProps} />;
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
