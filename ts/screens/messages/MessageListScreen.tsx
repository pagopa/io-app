import { Text, View } from "native-base";
import * as React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";

import MessageListComponent from "../../components/messages/MessageListComponent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import I18n from "../../i18n";
import { loadMessagesRequest } from "../../store/actions/messages";
import { navigateToMessageDetailScreenAction } from "../../store/actions/navigation";
import { ReduxProps } from "../../store/actions/types";
import { orderedMessagesSelector } from "../../store/reducers/entities/messages";
import {
  messagesUIStatesByIdSelector,
  MessagesUIStatesByIdState
} from "../../store/reducers/entities/messages/messagesUIStatesById";
import {
  servicesByIdSelector,
  ServicesByIdState
} from "../../store/reducers/entities/services/servicesById";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";

type ReduxMappedProps = Readonly<{
  isLoading: boolean;
  messages: ReadonlyArray<MessageWithContentPO>;
  messagesUIStatesById: MessagesUIStatesByIdState;
  servicesById: ServicesByIdState;
  paymentByRptId: GlobalState["entities"]["paymentByRptId"];
}>;

type Props = NavigationScreenProps & ReduxMappedProps & ReduxProps;

const styles = StyleSheet.create({
  emptyContentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  emptyContentText: {
    marginBottom: 10
  }
});

class MessageListScreen extends React.Component<Props, never> {
  private refreshMessageList = () => this.props.dispatch(loadMessagesRequest());

  private handleMessageListItemPress = (messageId: string) => {
    this.props.dispatch(navigateToMessageDetailScreenAction({ messageId }));
  };

  public componentDidMount() {
    this.refreshMessageList();
  }

  public render() {
    const {
      isLoading,
      messages,
      messagesUIStatesById,
      servicesById,
      paymentByRptId
    } = this.props;

    return (
      <TopScreenComponent
        title={I18n.t("messages.contentTitle")}
        icon={require("../../../img/icons/message-icon.png")}
      >
        {/* Render empty state */}
        {messages.length === 0 && (
          <View style={styles.emptyContentContainer}>
            <Text style={styles.emptyContentText}>
              {I18n.t("messages.counting.zero")}
            </Text>
            {isLoading && (
              <ActivityIndicator size="large" color={variables.brandPrimary} />
            )}
          </View>
        )}

        {/* Render full state */}
        {messages.length > 0 && (
          <MessageListComponent
            messages={messages}
            messagesUIStatesById={messagesUIStatesById}
            servicesById={servicesById}
            paymentByRptId={paymentByRptId}
            refreshing={isLoading}
            onRefresh={this.refreshMessageList}
            onListItemPress={this.handleMessageListItemPress}
          />
        )}
      </TopScreenComponent>
    );
  }
}

const messagesLoadSelector = createLoadingSelector([
  FetchRequestActions.MESSAGES_LOAD
]);

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  isLoading: messagesLoadSelector(state),
  messages: orderedMessagesSelector(state),
  messagesUIStatesById: messagesUIStatesByIdSelector(state),
  servicesById: servicesByIdSelector(state),
  paymentByRptId: state.entities.paymentByRptId
});

export default connect(mapStateToProps)(MessageListScreen);
