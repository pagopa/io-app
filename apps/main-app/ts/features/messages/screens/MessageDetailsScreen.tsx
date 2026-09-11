import { ServiceId } from "@io-app/api-types/generated/definitions/services/ServiceId";
import {
  ContentWrapper,
  Icon,
  ScrollViewWithStickyFooterActions,
  VSpacer
} from "@io-app/design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { useCallback, useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector, useIOStore } from "../../../store/hooks";
import {
  trackPNOptInMessageCTADisplaySuccess,
  trackPNOptInMessageOpened
} from "../../pn/analytics";
import { extractPNOptInMessageInfoIfAvailable } from "../../pn/utils";
import { MessageAttachmentsAlert } from "../components/MessageAttachment/MessageAttachmentsAlert";
import { MessageDetailsAttachments } from "../components/MessageDetail/MessageDetailsAttachments";
import { MessageDetailsBody } from "../components/MessageDetail/MessageDetailsBody";
import { MessageDetailsFooter } from "../components/MessageDetail/MessageDetailsFooter";
import { MessageDetailsHeader } from "../components/MessageDetail/MessageDetailsHeader";
import { MessageDetailsPayment } from "../components/MessageDetail/MessageDetailsPayment";
import { MessageDetailsReminder } from "../components/MessageDetail/MessageDetailsReminder";
import { RemoteContentBanner } from "../components/MessageDetail/RemoteContentBanner";
import { StandardMessageSurveyBanner } from "../components/MessageSurveyBanner";
import { useMessageDetailsFooterActions } from "../hooks/useMessageDetailsFooterActions";
import { MessagesParamsList } from "../navigation/params";
import {
  cancelPaymentStatusTracking,
  cancelPreviousAttachmentDownload,
  cancelQueuedPaymentUpdates,
  resetGetMessageDataAction,
  startPaymentStatusTracking,
  updatePaymentForMessage
} from "../store/actions";
import { messageDetailsByIdSelector } from "../store/reducers/detailsById";
import { getPaginatedMessageById } from "../store/reducers/paginatedById";
import { userSelectedPaymentRptIdSelector } from "../store/reducers/payments";
import {
  hasAttachmentsSelector,
  messageMarkdownSelector,
  messageTitleSelector
} from "../store/reducers/thirdPartyById";
import { getMessageCTAs } from "../utils/ctas";

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

  const maybeCTAs = useMemo(
    () => getMessageCTAs(messageMarkdown, serviceId),
    [messageMarkdown, serviceId]
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
  const footerActions = useMessageDetailsFooterActions({
    ctas: maybeCTAs,
    firstCTAIsPNOptInMessage: pnOptInMessageInfo.cta1LinksToPNService,
    messageId,
    secondCTAIsPNOptInMessage: pnOptInMessageInfo.cta2LinksToPNService,
    serviceId
  });

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
        subtitle={I18n.t("messageDetails.submitBugText")}
        title={I18n.t("global.genericError")}
      />
    );
  }
  return (
    <ScrollViewWithStickyFooterActions
      afterPlaceholder={
        <MessageDetailsFooter
          messageId={messageId}
          noticeNumber={messageDetails.paymentData?.noticeNumber}
          payeeFiscalCode={messageDetails.paymentData?.payee.fiscalCode}
          serviceId={serviceId}
        />
      }
      beforePlaceholder={
        <View style={styles.container}>
          <ContentWrapper>
            <MessageDetailsHeader
              createdAt={message.createdAt}
              messageId={messageId}
              serviceId={serviceId}
              subject={subject}
            >
              {hasAttachments && (
                <Icon
                  accessibilityLabel={I18n.t(
                    "messageDetails.accessibilityAttachmentIcon"
                  )}
                  name="attachment"
                  size={16}
                  testID="attachment-tag"
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
              serviceId={serviceId}
            />
            <MessageDetailsPayment
              messageId={messageId}
              serviceId={serviceId}
            />
            <VSpacer size={16} />
            <MessageDetailsAttachments
              banner={<MessageAttachmentsAlert />}
              messageId={messageId}
              sendOpeningSource={"not_set"}
              sendUserType={"not_set"}
              serviceId={serviceId}
            />
            {hasRemoteContent && <RemoteContentBanner />}
            <StandardMessageSurveyBanner message={message} />
          </ContentWrapper>
        </View>
      }
      footerActionProps={{ actions: footerActions }}
      scrollViewProps={{
        contentContainerStyle: styles.scrollContentContainer,
        testID: "MessageDetailsScrollView"
      }}
    />
  );
};
