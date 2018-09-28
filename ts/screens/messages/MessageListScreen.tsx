import { Text, View } from "native-base";
import * as React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import {
  NavigationActions,
  NavigationEventSubscription,
  NavigationScreenProps
} from "react-navigation";
import { connect } from "react-redux";

import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import MessageListComponent from "../../components/messages/MessageListComponent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { FetchRequestActions } from "../../store/actions/constants";
import { loadMessages } from "../../store/actions/messages";
import { ReduxProps } from "../../store/actions/types";
import { orderedMessagesSelector } from "../../store/reducers/entities/messages";
import {
  servicesByIdSelector,
  ServicesByIdState
} from "../../store/reducers/entities/services/servicesById";
import { createLoadingSelector } from "../../store/reducers/loading";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";

export type ReduxMappedProps = Readonly<{
  isLoading: boolean;
  messages: ReadonlyArray<MessageWithContentPO>;
  servicesById: ServicesByIdState;
}>;

export type Props = NavigationScreenProps & ReduxMappedProps & ReduxProps;

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

export class MessageListScreen extends React.Component<Props, never> {
  private didFocusSubscription?: NavigationEventSubscription;

  private refreshMessageList = () => this.props.dispatch(loadMessages());

  private handleMessageListItemPress = (messageId: string) => {
    this.props.dispatch(
      NavigationActions.navigate({
        routeName: ROUTES.MESSAGE_DETAIL,
        params: {
          messageId
        }
      })
    );
  };

  public componentDidMount() {
    // tslint:disable-next-line:no-object-mutation
    this.didFocusSubscription = this.props.navigation.addListener(
      "didFocus",
      _ => {
        this.refreshMessageList();
      }
    );
  }

  public componentWillUnmount() {
    if (this.didFocusSubscription) {
      this.didFocusSubscription.remove();
    }
  }

  public render() {
    const { isLoading, messages, servicesById } = this.props;

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
            servicesById={servicesById}
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
  servicesById: servicesByIdSelector(state)
});

export default withLoadingSpinner(
  connect(mapStateToProps)(MessageListScreen),
  createLoadingSelector(["PAYMENT_LOAD"]),
  {}
);
