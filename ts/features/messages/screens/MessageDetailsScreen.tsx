import { useCallback, useEffect, useMemo, useRef } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ContentWrapper, Icon, VSpacer } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import I18n from "i18next";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { MessagesParamsList } from "../navigation/params";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { useIODispatch, useIOSelector, useIOStore } from "../../../store/hooks";
import {
  cancelPaymentStatusTracking,
  cancelPreviousAttachmentDownload,
  cancelQueuedPaymentUpdates,
  resetGetMessageDataAction,
  startPaymentStatusTracking,
  updatePaymentForMessage
} from "../store/actions";
import { getPaginatedMessageById } from "../store/reducers/paginatedById";
import {
  hasAttachmentsSelector,
  messageMarkdownSelector,
  messageTitleSelector
} from "../store/reducers/thirdPartyById";
import { MessageDetailsAttachments } from "../components/MessageDetail/MessageDetailsAttachments";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { MessageDetailsHeader } from "../components/MessageDetail/MessageDetailsHeader";
import { messageDetailsByIdSelector } from "../store/reducers/detailsById";
import { getMessageCTAs } from "../utils/ctas";
import { MessageDetailsReminder } from "../components/MessageDetail/MessageDetailsReminder";
import { MessageDetailsFooter } from "../components/MessageDetail/MessageDetailsFooter";
import { MessageDetailsPayment } from "../components/MessageDetail/MessageDetailsPayment";
import { userSelectedPaymentRptIdSelector } from "../store/reducers/payments";
import { MessageDetailsStickyFooter } from "../components/MessageDetail/MessageDetailsStickyFooter";
import { MessageDetailsScrollViewAdditionalSpace } from "../components/MessageDetail/MessageDetailsScrollViewAdditionalSpace";
import { serviceMetadataByIdSelector } from "../../services/details/store/selectors";
import { extractPNOptInMessageInfoIfAvailable } from "../../pn/utils";
import {
  trackPNOptInMessageCTADisplaySuccess,
  trackPNOptInMessageOpened
} from "../../pn/analytics";
import { RemoteContentBanner } from "../components/MessageDetail/RemoteContentBanner";
import { MessageDetailsBody } from "../components/MessageDetail/MessageDetailsBody";

const styles = StyleSheet.create({
  scrollContentContainer: {
    flexGrow: 1
  },
  container: {
    flexGrow: 1
  }
});

export type MessageDetailsScreenRouteParams = {
  messageId: string;
  serviceId: ServiceId;
};

type MessageDetailsScreenProps = IOStackNavigationRouteProps<
  MessagesParamsList,
  "MESSAGE_DETAIL"
>;

export const MessageDetailsScreen = (props: MessageDetailsScreenProps) => {
  const { messageId, serviceId } = props.route.params;

  const dispatch = useIODispatch();
  const scrollViewRef = useRef<ScrollView>(null);

  const message = pipe(
    useIOSelector(state => getPaginatedMessageById(state, messageId)),
    pot.toOption,
    O.toUndefined
  );

  const messageDetails = pipe(
    useIOSelector(state => messageDetailsByIdSelector(state, messageId)),
    pot.toOption,
    O.toUndefined
  );

  const hasRemoteContent = messageDetails?.hasRemoteContent ?? false;
  const hasAttachments = useIOSelector(state =>
    hasAttachmentsSelector(state, messageId)
  );

  const subject =
    useIOSelector(state => messageTitleSelector(state, messageId)) ?? "";

  const messageMarkdown =
    useIOSelector(state => messageMarkdownSelector(state, messageId)) ?? "";

  const serviceMetadata = useIOSelector(state =>
    serviceMetadataByIdSelector(state, serviceId)
  );
  const maybeCTAs = useMemo(
    () => getMessageCTAs(messageMarkdown, serviceId, serviceMetadata),
    [messageMarkdown, serviceId, serviceMetadata]
  );

  // Use the store since `isPNOptInMessage` is not a selector but an utility
  // that uses a backend status configuration that is normally updated every
  // minute. We do not want to cause a re-rendering or recompute the value
  const store = useIOStore();
  const state = store.getState();
  const pnOptInMessageInfo = extractPNOptInMessageInfoIfAvailable(
    maybeCTAs,
    serviceId,
    state
  );
  const isPNOptInMessage = pnOptInMessageInfo.isPNOptInMessage;

  useHeaderSecondLevel({
    title: "",
    supportRequest: true
  });

  useEffect(() => {
    dispatch(startPaymentStatusTracking());
    if (isPNOptInMessage) {
      trackPNOptInMessageOpened();
      trackPNOptInMessageCTADisplaySuccess();
    }
    return () => {
      dispatch(cancelPreviousAttachmentDownload());
      dispatch(cancelQueuedPaymentUpdates({ messageId }));
      dispatch(cancelPaymentStatusTracking());
      dispatch(resetGetMessageDataAction());
    };
  }, [dispatch, messageId, isPNOptInMessage]);

  useFocusEffect(
    useCallback(() => {
      const globalState = store.getState();
      const paymentToCheckRptId = userSelectedPaymentRptIdSelector(
        globalState,
        messageDetails
      );
      if (paymentToCheckRptId) {
        dispatch(
          updatePaymentForMessage.request({
            messageId,
            paymentId: paymentToCheckRptId,
            serviceId
          })
        );
      }
    }, [dispatch, messageId, messageDetails, serviceId, store])
  );

  if (message === undefined || messageDetails === undefined) {
    return (
      <OperationResultScreenContent
        pictogram={"umbrella"}
        title={I18n.t("global.genericError")}
        subtitle={I18n.t("messageDetails.submitBugText")}
      />
    );
  }
  return (
    <>
      <ScrollView
        contentContainerStyle={styles.scrollContentContainer}
        ref={scrollViewRef}
      >
        <View style={styles.container}>
          <ContentWrapper>
            <MessageDetailsHeader
              messageId={messageId}
              serviceId={serviceId}
              subject={subject}
              createdAt={message.createdAt}
            >
              {hasAttachments && (
                <Icon
                  name="attachment"
                  accessibilityLabel={I18n.t(
                    "messageDetails.accessibilityAttachmentIcon"
                  )}
                  testID="attachment-tag"
                  size={16}
                />
              )}
            </MessageDetailsHeader>
            <VSpacer />
            <MessageDetailsReminder
              dueDate={messageDetails.dueDate}
              messageId={messageId}
              title={subject}
            />
            <MessageDetailsBody
              messageMarkdown={messageMarkdown}
              scrollViewRef={scrollViewRef}
              serviceId={serviceId}
            />
            <MessageDetailsPayment
              messageId={messageId}
              serviceId={serviceId}
            />
            <VSpacer size={16} />
            <MessageDetailsAttachments
              messageId={messageId}
              serviceId={serviceId}
              sendOpeningSource={"not_set"}
              sendUserType={"not_set"}
            />
            {hasRemoteContent && <RemoteContentBanner />}
          </ContentWrapper>
        </View>
        <VSpacer size={24} />
        <MessageDetailsFooter
          messageId={messageId}
          noticeNumber={messageDetails.paymentData?.noticeNumber}
          payeeFiscalCode={messageDetails.paymentData?.payee.fiscalCode}
          serviceId={serviceId}
        />
        <MessageDetailsScrollViewAdditionalSpace
          hasCTA1={!!maybeCTAs?.cta_1}
          hasCTA2={!!maybeCTAs?.cta_2}
          messageId={messageId}
        />
      </ScrollView>
      <MessageDetailsStickyFooter
        firstCTAIsPNOptInMessage={pnOptInMessageInfo.cta1LinksToPNService}
        messageId={messageId}
        ctas={maybeCTAs}
        secondCTAIsPNOptInMessage={pnOptInMessageInfo.cta2LinksToPNService}
        serviceId={serviceId}
      />
    </>
  );
};
