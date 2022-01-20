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
  MessageReadType,
  setMessageReadState
} from "../../../store/actions/messages";
import { navigateToServiceDetailsScreen } from "../../../store/actions/navigation";
import { loadServiceDetail } from "../../../store/actions/services";
import { CreatedMessageWithoutContent } from "../../../../definitions/backend/CreatedMessageWithoutContent";
import { Dispatch, ReduxProps } from "../../../store/actions/types";
import { messageStateByIdSelector } from "../../../store/reducers/entities/messages/messagesById";
import { isMessageRead } from "../../../store/reducers/entities/messages/messagesStatus";
import { paymentsByRptIdSelector } from "../../../store/reducers/entities/payments";
import {
  serviceByIdSelector,
  serviceMetadataByIdSelector
} from "../../../store/reducers/entities/services/servicesById";
import { GlobalState } from "../../../store/reducers/types";
import { InferNavigationParams } from "../../../types/react";
import ServiceDetailsScreen from "../../services/ServiceDetailsScreen";

import { hasMessagePaymentData } from "../../../utils/messages";
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
  private onServiceLinkPressHandler = (service: ServicePublic) => {
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
      this.props.setMessageReadState(
        potMessage.value.id,
        true,
        hasMessagePaymentData(potMessage.value) ? "payment" : "unknown"
      );
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
      maybeMeta,
      maybeServiceMetadata
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
          onRetry={() => maybeMeta.map(meta => loadMessageWithRelations(meta))}
          onServiceLinkPressHandler={_ =>
            this.props.maybeService.map(this.onServiceLinkPressHandler)
          }
          paymentsByRptId={paymentsByRptId}
          service={maybeService.toUndefined()}
          maybeServiceMetadata={maybeServiceMetadata}
        />
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => {
  const messageId = ownProps.navigation.getParam("messageId");
  const isRead = isMessageRead(state, messageId);
  const paymentsByRptId = paymentsByRptIdSelector(state);
  const goBack = () => ownProps.navigation.goBack();
  const potMessage = fromNullable(
    messageStateByIdSelector(messageId)(state)?.message
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
  const maybeMeta = fromNullable(
    messageStateByIdSelector(messageId)(state)?.meta
  );
  // Map the potential message to the potential service
  const maybeServiceMetadata = pot.toUndefined(
    pot.mapNullable(potMessage, m =>
      serviceMetadataByIdSelector(m.sender_service_id)(state)
    )
  );

  return {
    goBack,
    isRead,
    messageId,
    paymentsByRptId,
    potMessage,
    maybeService,
    maybeMeta,
    maybeServiceMetadata
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  refreshService: (serviceId: string) =>
    dispatch(loadServiceDetail.request(serviceId)),
  loadMessageWithRelations: (meta: CreatedMessageWithoutContent) =>
    dispatch(loadMessageWithRelations.request(meta)),
  setMessageReadState: (
    messageId: string,
    isRead: boolean,
    messageType: MessageReadType
  ) => dispatch(setMessageReadState(messageId, isRead, messageType)),
  navigateToServiceDetailsScreen: (
    params: InferNavigationParams<typeof ServiceDetailsScreen>
  ) => navigateToServiceDetailsScreen(params)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MessageDetailScreen);
