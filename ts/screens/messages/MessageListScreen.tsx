import * as pot from "italia-ts-commons/lib/pot";
import { Text, View } from "native-base";
import * as React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";

import MessageListComponent from "../../components/messages/MessageListComponent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import I18n from "../../i18n";
import { loadMessages } from "../../store/actions/messages";
import { navigateToMessageDetailScreenAction } from "../../store/actions/navigation";
import { ReduxProps } from "../../store/actions/types";
import { orderedMessagesWithIdSelector } from "../../store/reducers/entities/messages";
import { messagesUIStatesByIdSelector } from "../../store/reducers/entities/messages/messagesUIStatesById";
import { servicesByIdSelector } from "../../store/reducers/entities/services/servicesById";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";

type Props = NavigationScreenProps &
  ReturnType<typeof mapStateToProps> &
  ReduxProps;

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
  private refreshMessageList = () =>
    this.props.dispatch(loadMessages.request());

  private handleMessageListItemPress = (messageId: string) => {
    this.props.dispatch(navigateToMessageDetailScreenAction({ messageId }));
  };

  public componentDidMount() {
    this.refreshMessageList();
  }

  public render() {
    const {
      potMessages,
      messagesUIStatesById,
      servicesById,
      paymentByRptId
    } = this.props;

    const isLoading = pot.isLoading(potMessages);

    return (
      <TopScreenComponent
        title={I18n.t("messages.contentTitle")}
        icon={require("../../../img/icons/message-icon.png")}
      >
        {pot.isSome(potMessages) && potMessages.value.length > 0
          ? this.renderFullState(
              isLoading,
              potMessages.value,
              messagesUIStatesById,
              servicesById,
              paymentByRptId
            )
          : this.renderEmptyState(isLoading)}
      </TopScreenComponent>
    );
  }

  private renderEmptyState = (isLoading: boolean) => (
    <View style={styles.emptyContentContainer}>
      <Text style={styles.emptyContentText}>
        {I18n.t("messages.counting.zero")}
      </Text>
      {isLoading && (
        <ActivityIndicator size="large" color={variables.brandPrimary} />
      )}
    </View>
  );

  private renderFullState = (
    isLoading: boolean,
    messages: pot.PotType<Props["potMessages"]>,
    messagesUIStatesById: Props["messagesUIStatesById"],
    servicesById: Props["servicesById"],
    paymentByRptId: Props["paymentByRptId"]
  ) => (
    <MessageListComponent
      messages={messages}
      messagesUIStatesById={messagesUIStatesById}
      servicesById={servicesById}
      paymentByRptId={paymentByRptId}
      refreshing={isLoading}
      onRefresh={this.refreshMessageList}
      onListItemPress={this.handleMessageListItemPress}
    />
  );
}

const mapStateToProps = (state: GlobalState) => ({
  potMessages: orderedMessagesWithIdSelector(state),
  messagesUIStatesById: messagesUIStatesByIdSelector(state),
  servicesById: servicesByIdSelector(state),
  paymentByRptId: state.entities.paymentByRptId
});

export default connect(mapStateToProps)(MessageListScreen);
