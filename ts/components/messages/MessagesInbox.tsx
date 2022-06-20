/**
 * A component to render a list of visible (not yet archived) messages.
 * It acts like a wrapper for the MessageList component, filtering the messages
 * and adding the messages selection and archiving management.
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { View } from "native-base";
import React, { ComponentProps } from "react";
import { StyleSheet } from "react-native";
import I18n from "../../i18n";
import {
  lexicallyOrderedMessagesStateSelector,
  MessagesStateAndStatus
} from "../../store/reducers/entities/messages";
import {
  InjectedWithItemsSelectionProps,
  withItemsSelection
} from "../helpers/withItemsSelection";
import ListSelectionBar from "../ListSelectionBar";
import { EmptyListComponent } from "./EmptyListComponent";
import { ErrorLoadingComponent } from "./ErrorLoadingComponent";
import MessageList from "./MessageList";

const styles = StyleSheet.create({
  listWrapper: {
    flex: 1
  },
  listContainer: {
    flex: 1
  }
});

type OwnProps = {
  currentTab: number;
  messagesState: ReturnType<typeof lexicallyOrderedMessagesStateSelector>;
  navigateToMessageDetail: (id: string) => void;
  setMessagesArchivedState: (
    ids: ReadonlyArray<string>,
    archived: boolean
  ) => void;
};

type MessageListProps =
  | "servicesById"
  | "paymentsByRptId"
  | "onRefresh"
  | "animated";

type Props = Pick<ComponentProps<typeof MessageList>, MessageListProps> &
  OwnProps &
  InjectedWithItemsSelectionProps;

type State = {
  lastMessagesState: ReturnType<typeof lexicallyOrderedMessagesStateSelector>;
  filteredMessageStates: ReturnType<
    typeof generateMessagesStateNotArchivedArray
  >;
  allMessageIdsState: O.Option<Set<string>>;
};

/**
 * Filter only the messages that are not archived.
 */
const generateMessagesStateNotArchivedArray = (
  potMessagesState: pot.Pot<ReadonlyArray<MessagesStateAndStatus>, string>
): ReadonlyArray<MessagesStateAndStatus> =>
  pot.getOrElse(
    pot.map(potMessagesState, _ =>
      _.filter(messageState => !messageState.isArchived)
    ),
    []
  );

const ListEmptyComponent = () => (
  <EmptyListComponent
    image={require("../../../img/messages/empty-message-list-icon.png")}
    title={I18n.t("messages.inbox.emptyMessage.title")}
    subtitle={I18n.t("messages.inbox.emptyMessage.subtitle")}
  />
);

class MessagesInbox extends React.PureComponent<Props, State> {
  /**
   * Updates the filteredMessageStates only when necessary.
   */
  public static getDerivedStateFromProps(
    nextProps: Props,
    prevState: State
  ): Partial<State> | null {
    const { lastMessagesState } = prevState;
    if (nextProps.messagesState !== lastMessagesState) {
      // The list was updated, we need to re-apply the filter and
      // save the result in the state.
      const messagesStateNotArchived = generateMessagesStateNotArchivedArray(
        nextProps.messagesState
      );
      const allMessagesIdsArray = messagesStateNotArchived.map(_ => _.meta.id);
      return {
        filteredMessageStates: messagesStateNotArchived,
        lastMessagesState: nextProps.messagesState,
        allMessageIdsState: O.some(new Set(allMessagesIdsArray))
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
      allMessageIdsState: O.none
    };
  }

  public componentDidUpdate(prevProps: Props) {
    if (prevProps.currentTab !== this.props.currentTab) {
      this.props.resetSelection();
    }
  }

  public render() {
    const isLoading = pot.isLoading(this.props.messagesState);
    const { animated, selectedItemIds, resetSelection } = this.props;
    const { allMessageIdsState } = this.state;
    const isErrorLoading = pot.isError(this.props.messagesState);

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
              isErrorLoading ? <ErrorLoadingComponent /> : ListEmptyComponent()
            }
            animated={animated}
          />
        </View>
        {O.isSome(selectedItemIds) && O.isSome(allMessageIdsState) && (
          <ListSelectionBar
            selectedItems={pipe(
              selectedItemIds,
              O.map(_ => _.size),
              O.getOrElse(() => 0)
            )}
            totalItems={pipe(
              allMessageIdsState,
              O.map(_ => _.size),
              O.getOrElse(() => 0)
            )}
            onToggleSelection={this.archiveMessages}
            onToggleAllSelection={this.toggleAllMessagesSelection}
            onResetSelection={resetSelection}
            primaryButtonText={I18n.t("messages.cta.archive")}
          />
        )}
      </View>
    );
  }

  private handleOnPressItem = (id: string) => {
    if (O.isSome(this.props.selectedItemIds)) {
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
    if (O.isSome(allMessageIdsState) && O.isSome(selectedItemIds)) {
      this.props.setSelectedItemIds(
        allMessageIdsState.value.size === selectedItemIds.value.size
          ? O.some(new Set())
          : allMessageIdsState
      );
    }
  };

  private archiveMessages = () => {
    this.props.resetSelection();
    this.props.setMessagesArchivedState(
      pipe(
        this.props.selectedItemIds,
        O.map(_ => Array.from(_)),
        O.getOrElseW(() => [])
      ),
      true
    );
  };
}

export default withItemsSelection(MessagesInbox);
