import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { NavigationStackScreenProps } from "react-navigation-stack";
import { connect } from "react-redux";
import { Text, View } from "native-base";
import * as pot from "italia-ts-commons/lib/pot";

import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../components/screens/BaseScreenComponent";
import I18n from "../../../i18n";
import {
  loadMessageDetails,
  setMessageReadState
} from "../../../store/actions/messages";
import {
  navigateToServiceDetailsScreen,
  navigateToWalletHome
} from "../../../store/actions/navigation";
import { loadServiceDetail } from "../../../store/actions/services";
import { Dispatch, ReduxProps } from "../../../store/actions/types";
import {
  isMessageRead,
  messagesStatusSelector
} from "../../../store/reducers/entities/messages/messagesStatus";
import {
  serviceByIdSelector,
  serviceMetadataByIdSelector
} from "../../../store/reducers/entities/services/servicesById";
import { GlobalState } from "../../../store/reducers/types";
import { InferNavigationParams } from "../../../types/react";
import ServiceDetailsScreen from "../../services/ServiceDetailsScreen";
import MessageDetailComponent from "../../../components/messages/paginated/MessageDetail";
import { isNoticePaid } from "../../../store/reducers/entities/payments";
import { getDetailsByMessageId } from "../../../store/reducers/entities/messages/detailsById";
import ErrorState from "../MessageDetailScreen/ErrorState";
import { UIMessage } from "../../../store/reducers/entities/messages/types";

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

type MessageDetailScreenNavigationParams = {
  message: UIMessage;
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

const renderLoadingState = () => (
  <View style={styles.notFullStateContainer}>
    <Text style={styles.notFullStateMessageText}>
      {I18n.t("messageDetails.loadingText")}
    </Text>
    <ActivityIndicator />
  </View>
);

const MessageDetailScreen = ({
  goBack,
  hasPaidBadge,
  isRead,
  loadMessageDetails,
  maybeServiceMetadata,
  message,
  messageDetails,
  navigateToWalletHome,
  refreshService,
  service,
  setMessageReadState
}: Props) => {
  useEffect(() => {
    if (!isRead) {
      setMessageReadState(message.id, true);
    }
    loadMessageDetails(message.id);
  }, []);

  const onServiceLinkPressHandler = () => {
    // When a service gets selected, before navigating to the service detail
    // screen, we issue a loadServiceMetadata request to refresh the service metadata
    if (service) {
      navigateToServiceDetailsScreen({ service });
    }
  };

  const onRetry = () => {
    // we try to reload both the message content and the service
    const { id, serviceId } = message;
    refreshService(serviceId);
    loadMessageDetails(id);
  };

  const renderErrorState = () => (
    <ErrorState messageId={message.id} onRetry={onRetry} goBack={goBack} />
  );

  return pot.fold(
    messageDetails,
    () => (
      <View style={styles.notFullStateContainer}>
        <Text style={styles.notFullStateMessageText}>
          {I18n.t("messageDetails.emptyMessage")}
        </Text>
      </View>
    ),
    () => renderLoadingState(),
    () => renderLoadingState(),
    () => renderErrorState(),
    details => (
      <BaseScreenComponent
        headerTitle={I18n.t("messageDetails.headerTitle")}
        goBack={goBack}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["messages_detail"]}
      >
        <MessageDetailComponent
          hasPaidBadge={hasPaidBadge}
          message={message}
          messageDetails={details}
          navigateToWalletHome={navigateToWalletHome}
          organizationFiscalCode={service?.organization_fiscal_code}
          serviceMetadata={maybeServiceMetadata}
          onServiceLinkPress={onServiceLinkPressHandler}
        />
      </BaseScreenComponent>
    ),
    () => renderLoadingState(),
    () => renderLoadingState(),
    () => renderErrorState()
  );
};

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => {
  const message: UIMessage = ownProps.navigation.getParam("message");
  const messagesStatus = messagesStatusSelector(state);
  const messageDetails = getDetailsByMessageId(state, message.id);
  const isRead = isMessageRead(messagesStatus, message.id);
  const goBack = () => ownProps.navigation.goBack();
  const service = pot.toUndefined(
    serviceByIdSelector(message.serviceId)(state) || pot.none
  );
  // Map the potential message to the potential service
  const maybeServiceMetadata = serviceMetadataByIdSelector(message.serviceId)(
    state
  );
  const hasPaidBadge = isNoticePaid(state)(message.category);

  return {
    goBack,
    isRead,
    hasPaidBadge,
    message,
    messageDetails,
    maybeServiceMetadata,
    service
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  refreshService: (serviceId: string) =>
    dispatch(loadServiceDetail.request(serviceId)),
  loadMessageDetails: (id: string) =>
    dispatch(loadMessageDetails.request({ id })),
  setMessageReadState: (messageId: string, isRead: boolean) =>
    dispatch(setMessageReadState(messageId, isRead)),
  navigateToServiceDetailsScreen: (
    params: InferNavigationParams<typeof ServiceDetailsScreen>
  ) => navigateToServiceDetailsScreen(params),
  navigateToWalletHome: () => navigateToWalletHome()
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MessageDetailScreen);
