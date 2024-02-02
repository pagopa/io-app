import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React from "react";
import {
  View,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet
} from "react-native";
import { connect } from "react-redux";
import { VSpacer } from "@pagopa/io-app-design-system";
import { Body } from "../../../components/core/typography/Body";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import WorkunitGenericFailure from "../../../components/error/WorkunitGenericFailure";
import MessageDetailComponent from "../components/MessageDetail";
import ErrorState from "../components/MessageDetail/ErrorState";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../components/screens/BaseScreenComponent";
import I18n from "../../../i18n";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { isNoticePaidSelector } from "../../../store/reducers/entities/payments";
import {
  loadMessageDetails,
  resetGetMessageDataAction
} from "../store/actions";
import {
  navigateBack,
  navigateToServiceDetailsScreen
} from "../../../store/actions/navigation";
import { loadServiceDetail } from "../../../store/actions/services";
import { Dispatch, ReduxProps } from "../../../store/actions/types";
import { messageDetailsByIdSelector } from "../store/reducers/detailsById";
import { getPaginatedMessageById } from "../store/reducers/paginatedById";
import { UIMessageId } from "../types";
import {
  serviceByIdSelector,
  serviceMetadataByIdSelector
} from "../../../store/reducers/entities/services/servicesById";
import { toUIService } from "../../../store/reducers/entities/services/transformers";
import { GlobalState } from "../../../store/reducers/types";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { MessagesParamsList } from "../navigation/params";

const styles = StyleSheet.create({
  notFullStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

type OwnProps = IOStackNavigationRouteProps<
  MessagesParamsList,
  "MESSAGE_DETAIL"
>;

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
    <Body>{I18n.t("messageDetails.loadingText")}</Body>
    <VSpacer size={8} />
    <ActivityIndicator />
  </View>
);

const LegacyMessageDetailScreen = ({
  goBack,
  hasPaidBadge,
  loadMessageDetails,
  maybeServiceMetadata,
  messageId,
  serviceId,
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
      loadMessageDetails(messageId);
    }
  });

  const onServiceLinkPressHandler = () => {
    // When a service gets selected, before navigating to the service detail
    // screen, we issue a loadServiceMetadata request to refresh the service metadata
    if (service) {
      navigateToServiceDetailsScreen({ serviceId: service.raw.service_id });
    }
  };

  const onRetry = () => {
    // we try to reload both the message content and the service
    refreshService(serviceId);
    loadMessageDetails(messageId);
  };

  const renderErrorState = () => (
    <ErrorState messageId={messageId} onRetry={onRetry} goBack={goBack} />
  );

  return message ? (
    pot.fold(
      messageDetails,
      () => (
        <View style={styles.notFullStateContainer}>
          <Body>{I18n.t("messageDetails.emptyMessage")}</Body>
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
          <SafeAreaView style={IOStyles.flex}>
            <MessageDetailComponent
              hasPaidBadge={hasPaidBadge}
              message={message}
              messageDetails={details}
              service={service}
              serviceMetadata={maybeServiceMetadata}
              onServiceLinkPress={onServiceLinkPressHandler}
            />
          </SafeAreaView>
        </BaseScreenComponent>
      ),
      () => renderLoadingState(),
      () => renderLoadingState(),
      () => renderErrorState()
    )
  ) : (
    <WorkunitGenericFailure />
  );
};

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => {
  const messageId = ownProps.route.params.messageId;
  const serviceId = ownProps.route.params.serviceId;
  const message = pot.toUndefined(getPaginatedMessageById(state, messageId));
  const messageDetails = messageDetailsByIdSelector(state, messageId);
  const service = pipe(
    pot.toOption(serviceByIdSelector(state, serviceId)),
    O.map(toUIService),
    O.toUndefined
  );
  // Map the potential message to the potential service
  const maybeServiceMetadata = serviceMetadataByIdSelector(serviceId)(state);
  const hasPaidBadge: boolean = message
    ? isNoticePaidSelector(state, message.category)
    : false;

  return {
    messageId,
    serviceId,
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
    dispatch(loadMessageDetails.request({ id })),
  goBack: () => {
    dispatch(resetGetMessageDataAction());
    return navigateBack();
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LegacyMessageDetailScreen);
