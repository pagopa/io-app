import { VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { Route, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  View
} from "react-native";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { Body } from "../../../components/core/typography/Body";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import WorkunitGenericFailure from "../../../components/error/WorkunitGenericFailure";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../components/screens/BaseScreenComponent";
import I18n from "../../../i18n";
import {
  navigateBack,
  navigateToServiceDetailsScreen
} from "../../../store/actions/navigation";
import { loadServiceDetail } from "../../services/details/store/actions/details";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { isNoticePaidSelector } from "../../../store/reducers/entities/payments";
import {
  serviceByIdPotSelector,
  serviceMetadataByIdSelector
} from "../../services/details/store/reducers/servicesById";
import { toUIService } from "../../../store/reducers/entities/services/transformers";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import MessageDetailComponent from "../components/MessageDetail";
import ErrorState from "../components/MessageDetail/ErrorState";
import {
  loadMessageDetails,
  resetGetMessageDataAction
} from "../store/actions";
import { messageDetailsByIdSelector } from "../store/reducers/detailsById";
import { getPaginatedMessageById } from "../store/reducers/paginatedById";
import { UIMessageId } from "../types";

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
    pot.toOption(
      useIOSelector(state => serviceByIdPotSelector(state, serviceId))
    ),
    O.map(toUIService),
    O.toUndefined
  );
  // Map the potential message to the potential service
  const maybeServiceMetadata = useIOSelector(state =>
    serviceMetadataByIdSelector(state, serviceId)
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
