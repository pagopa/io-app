import * as pot from "italia-ts-commons/lib/pot";
import { Text, View } from "native-base";
import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { NavigationStackScreenProps } from "react-navigation-stack";
import { connect } from "react-redux";
import MessageDetailComponent from "../../../components/messages/paginated/MessageDetail";

import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../components/screens/BaseScreenComponent";
import I18n from "../../../i18n";
import { loadMessageDetails } from "../../../store/actions/messages";
import { navigateToServiceDetailsScreen } from "../../../store/actions/navigation";
import { loadServiceDetail } from "../../../store/actions/services";
import { Dispatch, ReduxProps } from "../../../store/actions/types";
import { getDetailsByMessageId } from "../../../store/reducers/entities/messages/detailsById";
import {
  UIMessage,
  UIMessageId
} from "../../../store/reducers/entities/messages/types";
import { isNoticePaid } from "../../../store/reducers/entities/payments";
import {
  serviceByIdSelector,
  serviceMetadataByIdSelector
} from "../../../store/reducers/entities/services/servicesById";
import { toUIService } from "../../../store/reducers/entities/services/transformers";
import { GlobalState } from "../../../store/reducers/types";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import ErrorState from "../MessageDetailScreen/ErrorState";

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

export type MessageDetailScreenPaginatedNavigationParams = {
  message: UIMessage;
};

type OwnProps =
  NavigationStackScreenProps<MessageDetailScreenPaginatedNavigationParams>;

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
  loadMessageDetails,
  maybeServiceMetadata,
  message,
  messageDetails,
  refreshService,
  service
}: Props) => {
  useOnFirstRender(() => {
    if (
      pot.isError(messageDetails) ||
      (pot.isNone(messageDetails) && !pot.isLoading(messageDetails))
    ) {
      loadMessageDetails(message.id);
    }
  });

  const onServiceLinkPressHandler = () => {
    // When a service gets selected, before navigating to the service detail
    // screen, we issue a loadServiceMetadata request to refresh the service metadata
    if (service) {
      navigateToServiceDetailsScreen({ service: service.raw });
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
        backButtonTestID={"back-button"}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["messages_detail"]}
      >
        <MessageDetailComponent
          hasPaidBadge={hasPaidBadge}
          message={message}
          messageDetails={details}
          service={service}
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
  const messageDetails = getDetailsByMessageId(state, message.id);
  const goBack = () => ownProps.navigation.goBack();
  const service = pot
    .toOption(serviceByIdSelector(message.serviceId)(state) || pot.none)
    .map(toUIService)
    .toUndefined();
  // Map the potential message to the potential service
  const maybeServiceMetadata = serviceMetadataByIdSelector(message.serviceId)(
    state
  );
  const hasPaidBadge = isNoticePaid(state, message.category);

  return {
    goBack,
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
  loadMessageDetails: (id: UIMessageId) =>
    dispatch(loadMessageDetails.request({ id }))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MessageDetailScreen);
