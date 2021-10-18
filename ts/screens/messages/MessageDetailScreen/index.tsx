import * as React from "react";
import { NavigationStackScreenProps } from "react-navigation-stack";
import { connect } from "react-redux";
import { fromNullable, none } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { ServicePublic } from "../../../../definitions/backend/ServicePublic";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../components/screens/BaseScreenComponent";
import I18n from "../../../i18n";
import {
  loadMessageWithRelations,
  setMessageReadState
} from "../../../store/actions/messages";
import { navigateToServiceDetailsScreen } from "../../../store/actions/navigation";
import { loadServiceDetail } from "../../../store/actions/services";
import { Dispatch, ReduxProps } from "../../../store/actions/types";
import { messageStateByIdSelector } from "../../../store/reducers/entities/messages/messagesById";
import {
  isMessageRead,
  messagesStatusSelector
} from "../../../store/reducers/entities/messages/messagesStatus";
import { paymentsByRptIdSelector } from "../../../store/reducers/entities/payments";
import { serviceByIdSelector } from "../../../store/reducers/entities/services/servicesById";
import { GlobalState } from "../../../store/reducers/types";
import { InferNavigationParams } from "../../../types/react";
import ServiceDetailsScreen from "../../services/ServiceDetailsScreen";

import MessageDetails from "./MessageDetail";

type MessageDetailScreenNavigationParams = {
  messageId: string;
};

type OwnProps = NavigationStackScreenProps<MessageDetailScreenNavigationParams>;

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  ReduxProps;

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "messageDetails.contextualHelpTitle",
  body: "messageDetails.contextualHelpContent"
};

export class MessageDetailScreen extends React.PureComponent<Props, never> {
  onServiceLinkPressHandler = (service: ServicePublic) => {
    // When a service gets selected, before navigating to the service detail
    // screen, we issue a loadServiceMetadata request to refresh the service metadata
    this.props.navigateToServiceDetailsScreen({
      service
    });
  };

  private setMessageReadState = () => {
    const { potMessage, isRead } = this.props;
    if (pot.isSome(potMessage) && !isRead) {
      // Set the message read state to TRUE
      this.props.setMessageReadState(potMessage.value.id, true);
    }
  };

  public componentDidMount() {
    const { potMessage, refreshService } = this.props;
    // if the message is loaded then refresh sender service data
    if (pot.isSome(potMessage)) {
      refreshService(potMessage.value.sender_service_id);
    }
    this.setMessageReadState();
  }

  public componentDidUpdate(prevProps: Props) {
    const { potMessage, refreshService } = this.props;
    const { potMessage: prevPotMessage } = prevProps;

    // if the message was not yet loaded in the component's mount, the service is refreshed here once the message is loaded
    if (!pot.isSome(prevPotMessage) && pot.isSome(potMessage)) {
      this.setMessageReadState();
      refreshService(potMessage.value.sender_service_id);
    }
  }

  public render() {
    const {
      goBack,
      loadMessageWithRelations,
      maybeService,
      messageId,
      paymentsByRptId,
      potMessage,
      refreshService
    } = this.props;

    return (
      <BaseScreenComponent
        headerTitle={I18n.t("messageDetails.headerTitle")}
        goBack={goBack}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["messages_detail"]}
      >
        <MessageDetails
          goBack={goBack}
          potMessage={potMessage}
          messageId={messageId}
          onRetry={() => loadMessageWithRelations(messageId)}
          onServiceLinkPressHandler={(id: string) => refreshService(id)}
          paymentsByRptId={paymentsByRptId}
          service={maybeService.toUndefined()}
        />
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => {
  const messageId = ownProps.navigation.getParam("messageId");
  const messagesStatus = messagesStatusSelector(state);
  const isRead = isMessageRead(messagesStatus, messageId);
  const paymentsByRptId = paymentsByRptIdSelector(state);
  const goBack = () => ownProps.navigation.goBack();
  const potMessage = fromNullable(
    messageStateByIdSelector(messageId)(state)
  ).getOrElse(pot.none);
  const maybeServiceId = pot.toOption(potMessage).map(_ => _.sender_service_id);
  const maybeService = maybeServiceId
    .map(_ => serviceByIdSelector(_)(state))
    .chain(maybePot => {
      if (maybePot) {
        return pot.toOption(maybePot);
      }
      return none;
    });

  return {
    goBack,
    isRead,
    messageId,
    paymentsByRptId,
    potMessage,
    maybeService
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  refreshService: (serviceId: string) =>
    dispatch(loadServiceDetail.request(serviceId)),
  loadMessageWithRelations: (messageId: string) =>
    dispatch(loadMessageWithRelations.request(messageId)),
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
