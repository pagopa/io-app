import { Button, Content, Text, View } from "native-base";
import * as React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";

import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { ServiceId } from "../../../definitions/backend/ServiceId";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import MessageDetailComponent from "../../components/messages/MessageDetailComponent";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import { FetchRequestActions } from "../../store/actions/constants";
import { contentServiceLoad } from "../../store/actions/content";
import {
  loadMessageWithRelationsAction,
  setMessageReadState
} from "../../store/actions/messages";
import { navigateToServiceDetailsScreen } from "../../store/actions/navigation";
import { Dispatch, ReduxProps } from "../../store/actions/types";
import { messageByIdSelector } from "../../store/reducers/entities/messages/messagesById";
import {
  makeMessageUIStatesByIdSelector,
  MessageUIStates
} from "../../store/reducers/entities/messages/messagesUIStatesById";
import { serviceByIdSelector } from "../../store/reducers/entities/services/servicesById";
import { createErrorSelector } from "../../store/reducers/error";
import { createLoadingSelector } from "../../store/reducers/loading";
import { GlobalState } from "../../store/reducers/types";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";
import * as pot from "../../types/pot";
import { InferNavigationParams } from "../../types/react";
import ServiceDetailsScreen from "../preferences/ServiceDetailsScreen";

type MessageDetailScreenNavigationParams = {
  messageId: NonEmptyString;
};

type OwnProps = NavigationScreenProps<MessageDetailScreenNavigationParams>;

type ReduxMappedStateProps = Readonly<{
  messageId: NonEmptyString;
  message: pot.Pot<MessageWithContentPO, Error>;
  messageUIStates: MessageUIStates;
  service: pot.Pot<ServicePublic, Error>;
}>;

type ReduxMappedDispatchProps = Readonly<{
  contentServiceLoad: (serviceId: ServiceId) => void;
  loadMessageWithRelations: (messageId: NonEmptyString) => void;
  setMessageReadState: (messageId: NonEmptyString, isRead: boolean) => void;
  navigateToServiceDetailsScreen: (
    params: InferNavigationParams<typeof ServiceDetailsScreen>
  ) => void;
}>;

type Props = OwnProps &
  ReduxMappedStateProps &
  ReduxMappedDispatchProps &
  ReduxProps;

const styles = StyleSheet.create({
  notFullStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  notFullStateMessageText: {
    marginBottom: 10
  }
});

export class MessageDetailScreen extends React.PureComponent<Props, never> {
  private goBack = () => this.props.navigation.goBack();

  private onServiceLinkPressHandler = (service: ServicePublic) => {
    // When a service gets selected, before navigating to the service detail
    // screen, we issue a contentServiceLoad to refresh the service metadata
    this.props.contentServiceLoad(service.service_id);
    this.props.navigateToServiceDetailsScreen({
      service
    });
  };

  /**
   * Used when the App is trying to load the message/service.
   */
  private renderLoadingState = () => {
    return (
      <View style={styles.notFullStateContainer}>
        <Text style={styles.notFullStateMessageText}>
          {I18n.t("messageDetails.loadingText")}
        </Text>
        <ActivityIndicator />
      </View>
    );
  };

  /**
   * Used when something went wrong but there is a way to recover.
   * (ex. the loading of the message/service failed but we can retry)
   */
  private renderErrorState = (messageId: NonEmptyString) => {
    return (
      <View style={styles.notFullStateContainer}>
        <Text style={styles.notFullStateMessageText}>
          {I18n.t("messageDetails.errorText")}
        </Text>
        <Button
          primary={true}
          onPress={() => this.props.loadMessageWithRelations(messageId)}
        >
          <Text>{I18n.t("messageDetails.retryText")}</Text>
        </Button>
      </View>
    );
  };

  /**
   * Used when we have all data to properly render the content of the screen.
   */
  private renderFullState = (
    message: MessageWithContentPO,
    service: pot.Pot<ServicePublic, Error>
  ) => {
    return (
      <Content noPadded={true}>
        <MessageDetailComponent
          message={message}
          service={service}
          onServiceLinkPress={
            pot.isSome(service)
              ? () => this.onServiceLinkPressHandler(service.value)
              : undefined
          }
        />
      </Content>
    );
  };

  private renderCurrentState = () => {
    const { message, messageId, service } = this.props;

    if (pot.isSome(message)) {
      return this.renderFullState(message.value, service);
    }

    if (pot.isError(message)) {
      return this.renderErrorState(messageId);
    }

    return this.renderLoadingState();
  };

  private loadMessageOrSetRead = () => {
    const { message, messageId, messageUIStates } = this.props;
    // If the message is empty (e.g. coming from a push notification or deep
    // link), trigger a load.
    if (
      pot.isNone(message) &&
      !pot.isLoading(message) &&
      !pot.isError(message)
    ) {
      this.props.loadMessageWithRelations(messageId);
    } else if (!messageUIStates.read) {
      // if this message has never been read, set its read state to true
      this.props.setMessageReadState(messageId, true);
    }
  };

  public componentDidMount() {
    this.loadMessageOrSetRead();
  }

  public componentDidUpdate() {
    this.loadMessageOrSetRead();
  }

  public render() {
    return (
      <BaseScreenComponent
        headerTitle={I18n.t("messageDetails.headerTitle")}
        goBack={this.goBack}
      >
        {this.renderCurrentState()}
      </BaseScreenComponent>
    );
  }
}

const messageWithRelationsLoadLoadingSelector = createLoadingSelector([
  FetchRequestActions.MESSAGE_WITH_RELATIONS_LOAD
]);

const messageWithRelationsLoadErrorSelector = createErrorSelector([
  FetchRequestActions.MESSAGE_WITH_RELATIONS_LOAD
]);

const mapStateToProps = (
  state: GlobalState,
  ownProps: OwnProps
): ReduxMappedStateProps => {
  const messageId = ownProps.navigation.getParam("messageId");
  const messageUIStates = makeMessageUIStatesByIdSelector(messageId)(state);

  const isLoading = messageWithRelationsLoadLoadingSelector(state);
  const hasError = messageWithRelationsLoadErrorSelector(state).isSome();
  const maybeMessage = messageByIdSelector(messageId)(state);

  const message =
    maybeMessage !== undefined
      ? pot.some(maybeMessage)
      : isLoading
        ? pot.noneLoading
        : hasError
          ? pot.noneError(Error())
          : pot.none;

  const service = pot.isSome(message)
    ? serviceByIdSelector(message.value.sender_service_id)(state) || pot.none
    : pot.none;

  return {
    messageId,
    message,
    messageUIStates,
    service
  };
};

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  contentServiceLoad: (serviceId: ServiceId) =>
    dispatch(contentServiceLoad(serviceId)),
  loadMessageWithRelations: (messageId: string) =>
    dispatch(loadMessageWithRelationsAction(messageId)),
  setMessageReadState: (messageId: string, isRead: boolean) =>
    dispatch(setMessageReadState(messageId, isRead)),
  navigateToServiceDetailsScreen: (
    params: InferNavigationParams<typeof ServiceDetailsScreen>
  ) => dispatch(navigateToServiceDetailsScreen(params))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MessageDetailScreen);
