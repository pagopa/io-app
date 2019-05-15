import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Button, Content, H3, Text, View } from "native-base";
import * as React from "react";
import { ActivityIndicator, Image, StyleSheet } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";
import { CreatedMessageWithoutContent } from "../../../definitions/backend/CreatedMessageWithoutContent";
import { ServiceId } from "../../../definitions/backend/ServiceId";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import MessageDetailComponent from "../../components/messages/MessageDetailComponent";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import { contentServiceLoad } from "../../store/actions/content";
import {
  loadMessageWithRelations,
  setMessageReadState
} from "../../store/actions/messages";
import { navigateToServiceDetailsScreen } from "../../store/actions/navigation";
import { Dispatch, ReduxProps } from "../../store/actions/types";
import { messageStateByIdSelector } from "../../store/reducers/entities/messages/messagesById";
import { serviceByIdSelector } from "../../store/reducers/entities/services/servicesById";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";
import { InferNavigationParams } from "../../types/react";
import { clipboardSetStringWithFeedback } from "../../utils/clipboard";
import ServiceDetailsScreen from "../preferences/ServiceDetailsScreen";

type MessageDetailScreenNavigationParams = {
  messageId: string;
};

type OwnProps = NavigationScreenProps<MessageDetailScreenNavigationParams>;

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  ReduxProps;

const styles = StyleSheet.create({
  notFullStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  notFullStateMessageText: {
    marginBottom: 10
  },

  errorStateWrapper: {
    flex: 1,
    paddingHorizontal: customVariables.contentPadding
  },

  errorStateContentWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  errorStateHeader: {
    marginTop: 30,
    textAlign: "center"
  },

  errorStateMessageData: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 26,
    paddingHorizontal: customVariables.contentPadding
  },

  erroStateMessageDataLeft: {
    flex: 1
  },

  erroStateMessageDataRight: {
    flex: 0,
    paddingLeft: 10
  },

  errorStateMessageRetry: {
    marginTop: 16,
    color: customVariables.brandDarkestGray
  },

  errorStateMessageSubmitBug: {
    marginTop: 16,
    fontSize: customVariables.fontSizeSmall
  },

  errorStateFooterWrapper: {
    flex: 0,
    flexDirection: "row",
    paddingVertical: 16
  },

  errorStateCancelButton: {
    flex: 4
  },

  errorStateRetryButton: {
    flex: 8,
    marginLeft: 10
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
   * Renders the empty message state, when no message content is avaialable
   */
  private renderEmptyState = () => {
    return (
      <View style={styles.notFullStateContainer}>
        <Text style={styles.notFullStateMessageText}>
          {I18n.t("messageDetails.emptyMessage")}
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
  private renderErrorState = () => {
    const messageId = this.props.navigation.getParam("messageId");
    const onRetry = this.props.maybeMeta
      .map(_ => () => this.props.loadMessageWithRelations(_))
      .toUndefined();
    return (
      <View style={styles.errorStateWrapper}>
        <View style={styles.errorStateContentWrapper}>
          <Image
            source={require("../../../img/messages/error-message-detail-icon.png")}
          />
          <H3 style={styles.errorStateHeader}>
            {I18n.t("messageDetails.errorText")}
          </H3>
          <View style={styles.errorStateMessageData}>
            <View style={styles.erroStateMessageDataLeft}>
              <Text numberOfLines={1}>{`ID: ${messageId}`}</Text>
            </View>
            <View style={styles.erroStateMessageDataRight}>
              <Button
                xsmall={true}
                bordered={true}
                onPress={() => clipboardSetStringWithFeedback(messageId)}
              >
                <Text>{I18n.t("clipboard.copyText")}</Text>
              </Button>
            </View>
          </View>
          <Text alignCenter={true} style={styles.errorStateMessageRetry}>
            {I18n.t("messageDetails.retryText")}
          </Text>
          <Text alignCenter={true} style={styles.errorStateMessageSubmitBug}>
            {I18n.t("messageDetails.submitBugText")}
          </Text>
        </View>
        <View style={styles.errorStateFooterWrapper}>
          <Button
            block={true}
            cancel={true}
            onPress={this.goBack}
            style={styles.errorStateCancelButton}
          >
            <Text>{I18n.t("global.buttons.cancel")}</Text>
          </Button>
          <Button
            block={true}
            primary={true}
            onPress={onRetry}
            style={styles.errorStateRetryButton}
          >
            <Text>{I18n.t("global.buttons.retry")}</Text>
          </Button>
        </View>
      </View>
    );
  };

  /**
   * Used when we have all data to properly render the content of the screen.
   */
  private renderFullState = (
    message: MessageWithContentPO,
    service: pot.Pot<ServicePublic, Error>,
    paymentByRptId: Props["paymentByRptId"]
  ) => {
    return (
      <Content noPadded={true}>
        <MessageDetailComponent
          message={message}
          paymentByRptId={paymentByRptId}
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
    const { potMessage, potService, paymentByRptId } = this.props;

    if (pot.isSome(potMessage)) {
      return this.renderFullState(potMessage.value, potService, paymentByRptId);
    }
    if (pot.isLoading(potMessage)) {
      return this.renderLoadingState();
    }
    if (pot.isError(potMessage)) {
      return this.renderErrorState();
    }

    // Fallback to invalid state
    return this.renderEmptyState();
  };

  private setMessageReadState = () => {
    const { potMessage, maybeRead } = this.props;

    if (pot.isSome(potMessage) && !maybeRead.getOrElse(true)) {
      // Set the message read state to TRUE
      this.props.setMessageReadState(true);
    }
  };

  public componentDidMount() {
    this.setMessageReadState();
  }

  public componentDidUpdate() {
    this.setMessageReadState();
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

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => {
  const messageId = ownProps.navigation.getParam("messageId");
  const maybeMessageState = fromNullable(
    messageStateByIdSelector(messageId)(state)
  );

  const maybeMeta = maybeMessageState.map(_ => _.meta);

  const maybeRead = maybeMessageState.map(_ => _.isRead);

  // In case maybePotMessage is undefined we fallback to an empty message.
  // This mens we navigated to the message screen with a non-existing message
  // ID (should never happen!).
  const potMessage = maybeMessageState.map(_ => _.message).getOrElse(pot.none);

  // Map the potential message to the potential service
  const potService = maybeMessageState
    .mapNullable(_ => serviceByIdSelector(_.meta.sender_service_id)(state))
    .getOrElse(pot.none);

  return {
    maybeMeta,
    maybeRead,
    potMessage,
    potService,
    paymentByRptId: state.entities.paymentByRptId
  };
};

const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps) => {
  const messageId = ownProps.navigation.getParam("messageId");
  return {
    contentServiceLoad: (serviceId: ServiceId) =>
      dispatch(contentServiceLoad.request(serviceId)),
    loadMessageWithRelations: (meta: CreatedMessageWithoutContent) =>
      dispatch(loadMessageWithRelations.request(meta)),
    setMessageReadState: (isRead: boolean) =>
      dispatch(setMessageReadState(messageId, isRead)),
    navigateToServiceDetailsScreen: (
      params: InferNavigationParams<typeof ServiceDetailsScreen>
    ) => dispatch(navigateToServiceDetailsScreen(params))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MessageDetailScreen);
