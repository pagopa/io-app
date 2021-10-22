import { none, Option, some } from "fp-ts/lib/Option";
import { View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";

import I18n from "../../../i18n";
import {
  InjectedWithItemsSelectionProps,
  withItemsSelection
} from "../../helpers/withItemsSelection";
import { ListSelectionBar } from "../../ListSelectionBar";
import { ErrorLoadingComponent } from "../ErrorLoadingComponent";
import { UIMessage } from "../../../store/reducers/entities/messages/types";
import { EmptyListComponent } from "../EmptyListComponent";

import MessageList, { AnimatedProps } from "./MessageList";

const styles = StyleSheet.create({
  listWrapper: {
    flex: 1
  },
  listContainer: {
    flex: 1
  }
});

type OwnProps = {
  animated: AnimatedProps["animated"];
  currentTab: number;
  error?: string;
  isLoading: boolean;
  messages: ReadonlyArray<UIMessage>;
  navigateToMessageDetail: (id: string) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  setMessagesArchivedState: (
    ids: ReadonlyArray<string>,
    archived: boolean
  ) => void;
};

type Props = OwnProps & InjectedWithItemsSelectionProps;

type State = {
  allMessageIdsState: Option<Set<string>>;
};

class MessagesInbox extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      allMessageIdsState: none
    };
  }

  public componentDidUpdate(prevProps: OwnProps) {
    if (prevProps.currentTab !== this.props.currentTab) {
      // this.props.resetSelection();
    }
  }

  public render() {
    const {
      animated,
      messages,
      isLoading,
      error,
      selectedItemIds,
      resetSelection,
      onNextPage,
      onPreviousPage,
      toggleItemSelection,
      navigateToMessageDetail
    } = this.props;
    const allItemIds = some(new Set(messages.map(_ => _.id)));

    // TODO: a temporary view to test pagination
    return (
      <View style={styles.listWrapper}>
        <View style={styles.listContainer}>
          <MessageList
            messages={messages}
            onPressItem={(id: string) => {
              if (selectedItemIds.isSome()) {
                // Is the selection mode is active a simple "press" must act as
                // a "longPress" (select the item).
                toggleItemSelection(id);
              } else {
                navigateToMessageDetail(id);
              }
            }}
            onLongPressItem={toggleItemSelection}
            refreshing={isLoading}
            onRefresh={onPreviousPage}
            onLoadMore={onNextPage}
            selectedMessageIds={selectedItemIds}
            ListEmptyComponent={
              error !== undefined ? (
                <ErrorLoadingComponent />
              ) : (
                <EmptyListComponent
                  image={require("../../../../img/messages/empty-message-list-icon.png")}
                  title={I18n.t("messages.inbox.emptyMessage.title")}
                  subtitle={I18n.t("messages.inbox.emptyMessage.subtitle")}
                />
              )
            }
            animated={animated}
          />
        </View>
        <ListSelectionBar
          selectedItemIds={selectedItemIds}
          allItemIds={allItemIds}
          onToggleSelection={this.archiveMessages}
          onToggleAllSelection={this.toggleAllMessagesSelection}
          onResetSelection={resetSelection}
          primaryButtonText={I18n.t("messages.cta.archive")}
        />
      </View>
    );
  }

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
