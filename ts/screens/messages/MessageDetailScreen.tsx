import { Button, Content, Text, View } from "native-base";
import * as React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";

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

/**
 * The react-navigation getParam function requires a fallback value to use when the parameter
 * is not available.
 */
const NO_MESSAGE_ID_PARAM = "NO_MESSAGE_ID_PARAM";

type MessageDetailScreenNavigationParams = {
  messageId: string;
};

type OwnProps = NavigationScreenProps<MessageDetailScreenNavigationParams>;

type InvalidScreenState = {
  kind: "InvalidState";
};

const isInvalidState = (
  screenState: ScreenState
): screenState is InvalidScreenState => {
  return screenState.kind === "InvalidState";
};

type NeedLoadingScreenState = {
  kind: "NeedLoadingState";
  messageId: string;
};

const isNeedLoadingState = (
  screenState: ScreenState
): screenState is NeedLoadingScreenState => {
  return screenState.kind === "NeedLoadingState";
};

type LoadingScreenState = {
  kind: "LoadingState";
};

const isLoadingState = (
  screenState: ScreenState
): screenState is LoadingScreenState => {
  return screenState.kind === "LoadingState";
};

type ErrorScreenState = {
  kind: "ErrorState";
  messageId: string;
};

const isErrorState = (
  screenState: ScreenState
): screenState is ErrorScreenState => {
  return screenState.kind === "ErrorState";
};

type FullScreenState = {
  kind: "FullState";
  messageId: string;
  message: MessageWithContentPO;
  messageUIStates: MessageUIStates;
  service: pot.Pot<ServicePublic, Error>;
};

const isFullState = (
  screenState: ScreenState
): screenState is FullScreenState => {
  return screenState.kind === "FullState";
};

type ScreenState =
  | InvalidScreenState
  | NeedLoadingScreenState
  | LoadingScreenState
  | ErrorScreenState
  | FullScreenState;

type ReduxMappedStateProps = Readonly<{
  screenState: ScreenState;
}>;

type ReduxMappedDispatchProps = Readonly<{
  contentServiceLoad: (serviceId: ServiceId) => void;
  loadMessageWithRelations: (messageId: string) => void;
  setMessageReadState: (messageId: string, isRead: boolean) => void;
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
   * Used when something went wrong and there is no way to recover.
   * (ex. no messageId navigation parameter passed to the screen)
   */
  private renderInvalidState = () => {
    return (
      <View style={styles.notFullStateContainer}>
        <Text style={styles.notFullStateMessageText}>
          {I18n.t("messageDetails.invalidText")}
        </Text>
      </View>
    );
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
  private renderErrorState = (messageId: string) => {
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

  // TODO: Add a Provider and an HOC to manage multiple render states in a simpler way.
  private renderCurrentState = () => {
    const screenState = this.props.screenState;

    if (isInvalidState(screenState)) {
      return this.renderInvalidState();
    } else if (isLoadingState(screenState)) {
      return this.renderLoadingState();
    } else if (isErrorState(screenState)) {
      return this.renderErrorState(screenState.messageId);
    } else if (isFullState(screenState)) {
      return this.renderFullState(screenState.message, screenState.service);
    }

    // Fallback to invalid state
    return this.renderInvalidState();
  };

  public componentDidMount() {
    const { screenState } = this.props;

    /**
     * If the message in not in the store (ex. coming from a push notification or deep link)
     * try to load it.
     */
    if (isNeedLoadingState(screenState)) {
      this.props.loadMessageWithRelations(screenState.messageId);
    } else if (isFullState(screenState) && !screenState.messageUIStates.read) {
      // Set the message read state to TRUE
      this.props.setMessageReadState(screenState.messageId, true);
    }
  }

  public componentDidUpdate() {
    const { screenState } = this.props;

    if (isFullState(screenState) && !screenState.messageUIStates.read) {
      // Set the message read state to TRUE
      this.props.setMessageReadState(screenState.messageId, true);
    }
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
  /**
   * Try to get the messageId from the navigation parameters.
   */
  const messageId = ownProps.navigation.getParam(
    "messageId",
    NO_MESSAGE_ID_PARAM
  );

  if (messageId === NO_MESSAGE_ID_PARAM) {
    return {
      screenState: {
        kind: "InvalidState"
      }
    };
  }

  const isLoading = messageWithRelationsLoadLoadingSelector(state);

  if (isLoading) {
    return {
      screenState: {
        kind: "LoadingState"
      }
    };
  }

  const hasError = messageWithRelationsLoadErrorSelector(state).isSome();

  if (hasError) {
    return {
      screenState: {
        kind: "ErrorState",
        messageId
      }
    };
  }

  const message = messageByIdSelector(messageId)(state);
  const messageUIStates = makeMessageUIStatesByIdSelector(messageId)(state);

  if (message !== undefined) {
    const service = message
      ? serviceByIdSelector(message.sender_service_id)(state)
      : undefined;

    return {
      screenState: {
        kind: "FullState",
        messageId,
        message,
        messageUIStates,
        service: service !== undefined ? service : pot.none
      }
    };
  }

  return {
    screenState: {
      kind: "NeedLoadingState",
      messageId
    }
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
