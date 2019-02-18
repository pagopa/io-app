import { fromNullable, none, Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import React, { ComponentProps } from "react";
import { StyleSheet } from "react-native";

import { lexicallyOrderedMessagesStateSelector } from "../../store/reducers/entities/messages";
import { MessageState } from "../../store/reducers/entities/messages/messagesById";
import { ServicesByIdState } from "../../store/reducers/entities/services/servicesById";
import { messageContainsText } from "../../utils/messages";
import { serviceContainsText } from "../../utils/services";
import MessageListComponent from "./MessageListComponent";

const styles = StyleSheet.create({
  listWrapper: {
    flex: 1
  }
});

type OwnProps = {
  messagesState: ReturnType<typeof lexicallyOrderedMessagesStateSelector>;
  searchText: string;
  navigateToMessageDetail: (id: string) => void;
};

type Props = Pick<
  ComponentProps<typeof MessageListComponent>,
  "servicesById" | "paymentByRptId" | "onRefresh"
> &
  OwnProps;

type State = {
  lastMessagesState: ReturnType<typeof lexicallyOrderedMessagesStateSelector>;
  lastSearchText: Option<string>;
  filteredMessageStates: ReturnType<
    typeof generateMessagesStateMatchingSearchTextArray
  >;
};

/**
 * Filter only the messages that matchs the searchText.
 * The searchText is checked both in message and in service properties.
 */
const generateMessagesStateMatchingSearchTextArray = (
  potMessagesState: pot.Pot<ReadonlyArray<MessageState>, string>,
  servicesById: ServicesByIdState,
  searchText: string
): ReadonlyArray<MessageState> =>
  pot.getOrElse(
    pot.map(potMessagesState, _ =>
      _.filter(messageState =>
        pot.getOrElse(
          pot.map(
            messageState.message,
            message =>
              // Search in message properties
              messageContainsText(message, searchText) ||
              fromNullable(servicesById[message.sender_service_id])
                .map(potService =>
                  pot.getOrElse(
                    pot.map(potService, service =>
                      // Search in service properties
                      serviceContainsText(service, searchText)
                    ),
                    false
                  )
                )
                .getOrElse(false)
          ),
          false
        )
      )
    ),
    []
  );

/**
 * A component to render a list of messages that matches a searchText.
 */
class MessagesSearch extends React.PureComponent<Props, State> {
  /**
   * Updates the filteredMessageStates only when necessary.
   */
  public static getDerivedStateFromProps(
    nextProps: Props,
    prevState: State
  ): Partial<State> | null {
    const { lastMessagesState, lastSearchText } = prevState;

    if (
      lastMessagesState !== nextProps.messagesState ||
      lastSearchText.toNullable() !== nextProps.searchText
    ) {
      // The list was updated, we need to re-apply the filter and
      // save the result in the state.
      return {
        filteredMessageStates: generateMessagesStateMatchingSearchTextArray(
          nextProps.messagesState,
          nextProps.servicesById,
          nextProps.searchText
        ),
        lastSearchText: some(nextProps.searchText),
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
      lastSearchText: none,
      filteredMessageStates: []
    };
  }

  public render() {
    const isLoading = pot.isLoading(this.props.messagesState);

    return (
      <View style={styles.listWrapper}>
        <MessageListComponent
          {...this.props}
          messages={this.state.filteredMessageStates}
          onPressItem={this.handleOnPressItem}
          onLongPressItem={this.handleOnPressItem}
          refreshing={isLoading}
          selectedMessageIds={none}
        />
      </View>
    );
  }

  private handleOnPressItem = (id: string) => {
    this.props.navigateToMessageDetail(id);
  };
}

export default MessagesSearch;
