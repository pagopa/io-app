import { fromNullable, none } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import React, { ComponentProps } from "react";
import { StyleSheet } from "react-native";

import {
  lexicallyOrderedMessagesStateSelector,
  MessagesStateAndStatus
} from "../../store/reducers/entities/messages";
import { ServicesByIdState } from "../../store/reducers/entities/services/servicesById";
import { messageContainsText } from "../../utils/messages";
import { serviceContainsText } from "../../utils/services";
import { SearchNoResultMessage } from "../search/SearchNoResultMessage";
import MessageList from "./MessageList";

const styles = StyleSheet.create({
  listWrapper: {
    flex: 1
  }
});

type OwnProps = {
  messagesStateAndStatus: ReturnType<
    typeof lexicallyOrderedMessagesStateSelector
  >;
  searchText: string;
  navigateToMessageDetail: (id: string) => void;
};

type Props = Pick<
  ComponentProps<typeof MessageList>,
  "servicesById" | "paymentsByRptId" | "onRefresh"
> &
  OwnProps;

type State = {
  potFilteredMessageStates: pot.Pot<
    ReadonlyArray<MessagesStateAndStatus>,
    Error
  >;
};

/**
 * Filter only the messages that match the searchText.
 * The searchText is checked both in message and in service properties.
 */
const generateMessagesStateMatchingSearchTextArray = (
  input: ReadonlyArray<MessagesStateAndStatus>,
  servicesById: ServicesByIdState,
  searchText: string
): ReadonlyArray<MessagesStateAndStatus> =>
  input.filter(({ message: potMessage }) =>
    pot
      .toOption(potMessage)
      .map(message => [
        message.content ? messageContainsText(message, searchText) : false,
        fromNullable(servicesById[message.sender_service_id])
          .chain(potService => pot.toOption(potService))
          .map(service => serviceContainsText(service, searchText))
          .getOrElse(false)
      ])
      .map(([matchMessage, matchService]) => matchMessage || matchService)
      .getOrElse(false)
  );

/**
 * A component to render a list of messages that match a searchText.
 */
class MessagesSearch extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      potFilteredMessageStates: pot.none
    };
  }

  public componentDidMount() {
    const { messagesStateAndStatus, servicesById, searchText } = this.props;

    // Start filtering messages
    const filteredMessageStates = generateMessagesStateMatchingSearchTextArray(
      pot.getOrElse(messagesStateAndStatus, []),
      servicesById,
      searchText
    );

    // Unset filtering status
    this.setState({
      potFilteredMessageStates: pot.some(filteredMessageStates)
    });
  }

  public componentDidUpdate(prevProps: Props) {
    const {
      messagesStateAndStatus: prevMessagesState,
      searchText: prevSearchText
    } = prevProps;
    const { messagesStateAndStatus, servicesById, searchText } = this.props;
    const { potFilteredMessageStates } = this.state;

    if (
      messagesStateAndStatus !== prevMessagesState ||
      searchText !== prevSearchText
    ) {
      // Set filtering status
      this.setState({
        potFilteredMessageStates: pot.toLoading(potFilteredMessageStates)
      });

      // Start filtering messages
      const filteredMessageStates =
        generateMessagesStateMatchingSearchTextArray(
          pot.getOrElse(messagesStateAndStatus, []),
          servicesById,
          searchText
        );

      // Unset filtering status
      this.setState({
        potFilteredMessageStates: pot.some(filteredMessageStates)
      });
    }
  }

  public render() {
    const { potFilteredMessageStates } = this.state;

    const isLoading = pot.isLoading(this.props.messagesStateAndStatus);
    const isFiltering = pot.isLoading(potFilteredMessageStates);

    const filteredMessageStates: ReadonlyArray<MessagesStateAndStatus> =
      pot.getOrElse(potFilteredMessageStates, []);

    return filteredMessageStates.length > 0 ? (
      <View style={styles.listWrapper}>
        <MessageList
          {...this.props}
          messagesStateAndStatus={filteredMessageStates}
          onPressItem={this.handleOnPressItem}
          onLongPressItem={this.handleOnPressItem}
          refreshing={isLoading || isFiltering}
          selectedMessageIds={none}
        />
      </View>
    ) : (
      <SearchNoResultMessage errorType="NoResultsFound" />
    );
  }

  private handleOnPressItem = (id: string) => {
    this.props.navigateToMessageDetail(id);
  };
}

export default MessagesSearch;
