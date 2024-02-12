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
import { VSpacer } from "@pagopa/io-app-design-system";
import { Route, useRoute } from "@react-navigation/native";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { Body } from "../../../components/core/typography/Body";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import WorkunitGenericFailure from "../../../components/error/WorkunitGenericFailure";
import MessageDetailComponent from "../components/MessageDetail";
import ErrorState from "../components/MessageDetail/ErrorState";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../components/screens/BaseScreenComponent";
import I18n from "../../../i18n";
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
import { messageDetailsByIdSelector } from "../store/reducers/detailsById";
import { getPaginatedMessageById } from "../store/reducers/paginatedById";
import { UIMessageId } from "../types";
import {
  serviceByIdSelector,
  serviceMetadataByIdSelector
} from "../../../store/reducers/entities/services/servicesById";
import { toUIService } from "../../../store/reducers/entities/services/transformers";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { useIODispatch, useIOSelector } from "../../../store/hooks";

const styles = StyleSheet.create({
  notFullStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export type MessageDetailScreenNavigationParams = {
  messageId: UIMessageId;
  serviceId: ServiceId;
};

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

const LegacyMessageDetailScreen = () => {
  const { messageId, serviceId } =
    useRoute<Route<"MESSAGE_DETAIL", MessageDetailScreenNavigationParams>>()
      .params;
  const dispatch = useIODispatch();

  const refreshService = (serviceId: string) =>
    dispatch(loadServiceDetail.request(serviceId));
  const requestLoadMessageDetails = (id: UIMessageId) =>
    dispatch(loadMessageDetails.request({ id }));
  const goBack = () => {
    dispatch(resetGetMessageDataAction());
    return navigateBack();
  };

  const message = pot.toUndefined(
    useIOSelector(state => getPaginatedMessageById(state, messageId))
  );
  const messageDetails = useIOSelector(state =>
    messageDetailsByIdSelector(state, messageId)
  );
  const service = pipe(
    pot.toOption(useIOSelector(state => serviceByIdSelector(state, serviceId))),
    O.map(toUIService),
    O.toUndefined
  );
  // Map the potential message to the potential service
  const maybeServiceMetadata = useIOSelector(
    serviceMetadataByIdSelector(serviceId)
  );
  const hasPaidBadge: boolean = useIOSelector(state =>
    message ? isNoticePaidSelector(state, message.category) : false
  );

  useOnFirstRender(() => {
    if (
      pot.isError(messageDetails) ||
      (pot.isNone(messageDetails) && !pot.isLoading(messageDetails))
    ) {
      requestLoadMessageDetails(messageId);
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
    requestLoadMessageDetails(messageId);
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

export default LegacyMessageDetailScreen;
