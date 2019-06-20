import * as pot from "italia-ts-commons/lib/pot";
import { Button, Text, View } from "native-base";
import React, { ComponentProps } from "react";
import { Image, StyleSheet } from "react-native";

import { none, Option, some } from "fp-ts/lib/Option";
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
    bottom: 0,
    flexDirection: "row",
    zIndex: 1,
    justifyContent: "space-around",
    backgroundColor: customVariables.brandLightGray,
    padding: 10
  },
  buttonBarLeft: {
    flex: 2
  },
  buttonBarRight: {
    flex: 2
  },
  buttonBarCenter: {
    flex: 2,
    backgroundColor: customVariables.colorWhite,
    marginLeft: 10,
    marginRight: 10
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
  }
});

type OwnProps = {
  messagesState: ReturnType<typeof lexicallyOrderedMessagesStateSelector>;
  navigateToMessageDetail: (id: string) => void;
  setMessagesArchivedState: (
    ids: ReadonlyArray<string>,
    archived: boolean
  ) => void;
  isExperimentalFeaturesEnabled: boolean;
};

type Props = Pick<
  ComponentProps<typeof MessageList>,
  "servicesById" | "paymentsByRptId" | "onRefresh"
> &
  OwnProps &
  InjectedWithMessagesSelectionProps;

type State = {
  lastMessagesState: ReturnType<typeof lexicallyOrderedMessagesStateSelector>;
  filteredMessageStates: ReturnType<typeof generateMessagesStateArchivedArray>;
  allMessageIdsState: Option<Set<string>>;
};

const ListEmptyComponent = (
  <View style={styles.emptyListWrapper}>
    <View spacer={true} />
    <Image
      source={require("../../../img/messages/empty-archive-list-icon.png")}
    />
    <Text style={styles.emptyListContentTitle}>
      {I18n.t("messages.archive.emptyMessage.title")}
    </Text>
    <Text style={styles.emptyListContentSubtitle}>
      {I18n.t("messages.archive.emptyMessage.subtitle")}
    </Text>
  </View>
);

/**
 * Filter only the messages that are archived.
 */
const generateMessagesStateArchivedArray = (
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
 * It acts like a wrapper for the MessageList component, filtering the messages
 * and adding the messages selection and archiving management.
 */
class MessagesArchive extends React.PureComponent<Props, State> {
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
      const messagesStateArchived = generateMessagesStateArchivedArray(
        nextProps.messagesState
      );
      const allMessagesIdsArray = messagesStateArchived.map(_ => _.meta.id);
      return {
        filteredMessageStates: messagesStateArchived,
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
      selectedMessageIds,
      resetSelection,
      isExperimentalFeaturesEnabled,
      isAllMessagesSelected
    } = this.props;
    return (
      <View style={styles.listWrapper}>
        {selectedMessageIds.isSome() && (
          <View style={styles.buttonBar}>
            <Button
              block={true}
              bordered={true}
              light={true}
              onPress={resetSelection}
              style={
                isExperimentalFeaturesEnabled
                  ? styles.buttonBarLeft
                  : styles.buttonBarSecondaryButton
              }
            >
              <Text>{I18n.t("global.buttons.cancel")}</Text>
            </Button>
            {isExperimentalFeaturesEnabled && (
              <Button
                block={true}
                bordered={true}
                style={styles.buttonBarCenter}
                onPress={this.toggleAllMessagesSelection}
              >
                <Text>
                  {I18n.t(
                    isAllMessagesSelected
                      ? "messages.cta.deselectAll"
                      : "messages.cta.selectAll"
                  )}
                </Text>
              </Button>
            )}
            <Button
              block={true}
              style={
                isExperimentalFeaturesEnabled
                  ? styles.buttonBarRight
                  : styles.buttonBarPrimaryButton
              }
              disabled={selectedMessageIds.value.size === 0}
              onPress={this.unarchiveMessages}
            >
              <Text>{I18n.t("messages.cta.unarchive")}</Text>
            </Button>
          </View>
        )}
        <MessageList
          {...this.props}
          messageStates={this.state.filteredMessageStates}
          onPressItem={this.handleOnPressItem}
          onLongPressItem={this.handleOnLongPressItem}
          refreshing={isLoading}
          selectedMessageIds={selectedMessageIds}
          ListEmptyComponent={ListEmptyComponent}
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
    this.props.toggleMessageSelection(id, this.state.allMessageIdsState);
  };

  private toggleAllMessagesSelection = () => {
    this.props.toggleAllMessagesSelection(this.state.allMessageIdsState);
  };

  private unarchiveMessages = () => {
    this.props.resetSelection();
    this.props.setMessagesArchivedState(
      this.props.selectedMessageIds.map(_ => Array.from(_)).getOrElse([]),
      false
    );
  };
}

export default withMessagesSelection(MessagesArchive);
