import { fromNullable, none } from "fp-ts/lib/Option";
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
  potFilteredMessageStates: pot.Pot<ReadonlyArray<MessageState>, Error>;
};

/**
 * Filter only the messages that match the searchText.
 * The searchText is checked both in message and in service properties.
 */
const generateMessagesStateMatchingSearchTextArrayAsync = (
  potMessagesState: pot.Pot<ReadonlyArray<MessageState>, string>,
  servicesById: ServicesByIdState,
  searchText: string
): Promise<ReadonlyArray<MessageState>> => {
  return new Promise(resolve => {
    const result = pot.getOrElse(
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

    resolve(result);
  });
};

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

  public async componentDidMount() {
    const { messagesState, servicesById, searchText } = this.props;
    const { potFilteredMessageStates } = this.state;

    // Set filtering status
    this.setState({
      potFilteredMessageStates: pot.toLoading(potFilteredMessageStates)
    });

    // Start filtering messages
    const filteredMessageStates = await generateMessagesStateMatchingSearchTextArrayAsync(
      messagesState,
      servicesById,
      searchText
    );

    // Unset filtering status
    this.setState({
      potFilteredMessageStates: pot.some(filteredMessageStates)
    });
  }

  public async componentDidUpdate(prevProps: Props) {
    const {
      messagesState: prevMessagesState,
      searchText: prevSearchText
    } = prevProps;
    const { messagesState, servicesById, searchText } = this.props;
    const { potFilteredMessageStates } = this.state;

    if (messagesState !== prevMessagesState || searchText !== prevSearchText) {
      // Set filtering status
      this.setState({
        potFilteredMessageStates: pot.toLoading(potFilteredMessageStates)
      });

      // Start filtering messages
      const filteredMessageStates = await generateMessagesStateMatchingSearchTextArrayAsync(
        messagesState,
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

    const isLoading = pot.isLoading(this.props.messagesState);
    const isFiltering = pot.isLoading(potFilteredMessageStates);

    const filteredMessageStates = pot.getOrElse(potFilteredMessageStates, []);

    return (
      <View style={styles.listWrapper}>
        <MessageListComponent
          {...this.props}
          messages={filteredMessageStates}
          onPressItem={this.handleOnPressItem}
          onLongPressItem={this.handleOnPressItem}
          refreshing={isLoading || isFiltering}
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
