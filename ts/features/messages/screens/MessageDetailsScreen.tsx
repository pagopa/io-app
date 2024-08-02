import React, { useCallback, useMemo, useRef } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ContentWrapper, Icon, VSpacer } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { UIMessageId } from "../types";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { MessagesParamsList } from "../navigation/params";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../navigation/params/AppParamsList";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { useIODispatch, useIOSelector, useIOStore } from "../../../store/hooks";
import {
  cancelPreviousAttachmentDownload,
  cancelQueuedPaymentUpdates,
  resetGetMessageDataAction,
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
import I18n from "../../../i18n";
import { messageDetailsByIdSelector } from "../store/reducers/detailsById";
import { MessageDetailsTagBox } from "../components/MessageDetail/MessageDetailsTagBox";
import { MessageMarkdown } from "../components/MessageDetail/MessageMarkdown";
import { cleanMarkdownFromCTAs, getMessageCTA } from "../utils/messages";
import { MessageDetailsReminder } from "../components/MessageDetail/MessageDetailsReminder";
import { MessageDetailsFooter } from "../components/MessageDetail/MessageDetailsFooter";
import { MessageDetailsPayment } from "../components/MessageDetail/MessageDetailsPayment";
import { cancelPaymentStatusTracking } from "../../pn/store/actions";
import { userSelectedPaymentRptIdSelector } from "../store/reducers/payments";
import { MessageDetailsStickyFooter } from "../components/MessageDetail/MessageDetailsStickyFooter";
import { MessageDetailsScrollViewAdditionalSpace } from "../components/MessageDetail/MessageDetailsScrollViewAdditionalSpace";
import { serviceMetadataByIdSelector } from "../../services/details/store/reducers";
import { isPNOptInMessage } from "../../pn/utils";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import {
  trackPNOptInMessageCTADisplaySuccess,
  trackPNOptInMessageOpened
} from "../../pn/analytics";
import { RemoteContentBanner } from "../components/MessageDetail/RemoteContentBanner";
import { setAccessibilityFocus } from "../../../utils/accessibility";

const styles = StyleSheet.create({
  scrollContentContainer: {
    flexGrow: 1
  },
  container: {
    flexGrow: 1
  }
});

export type MessageDetailsScreenRouteParams = {
  messageId: UIMessageId;
  serviceId: ServiceId;
};

type MessageDetailsScreenProps = IOStackNavigationRouteProps<
  MessagesParamsList,
  "MESSAGE_DETAIL"
>;

export const MessageDetailsScreen = (props: MessageDetailsScreenProps) => {
  const { messageId, serviceId } = props.route.params;

  const navigation = useIONavigation();
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

  const goBack = useCallback(() => {
    dispatch(cancelPreviousAttachmentDownload());
    dispatch(cancelQueuedPaymentUpdates());
    dispatch(cancelPaymentStatusTracking());
    dispatch(resetGetMessageDataAction());
    navigation.goBack();
  }, [dispatch, navigation]);

  const messageMarkdown =
    useIOSelector(state => messageMarkdownSelector(state, messageId)) ?? "";
  const markdownWithNoCTA = useMemo(
    () => cleanMarkdownFromCTAs(messageMarkdown),
    [messageMarkdown]
  );
  const serviceMetadata = useIOSelector(state =>
    serviceMetadataByIdSelector(state, serviceId)
  );
  const maybeCTAs = useMemo(
    () =>
      pipe(
        getMessageCTA(messageMarkdown, serviceMetadata, serviceId),
        O.toUndefined
      ),
    [messageMarkdown, serviceId, serviceMetadata]
  );

  // Use the store since `isPNOptInMessage` is not a selector but an utility
  // that uses a backend status configuration that is normally updated every
  // minute. We do not want to cause a re-rendering or recompute the value
  const store = useIOStore();
  const state = store.getState();
  const pnOptInMessageInfo = isPNOptInMessage(maybeCTAs, serviceId, state);

  useHeaderSecondLevel({
    title: "",
    goBack,
    supportRequest: true
  });

  useOnFirstRender(
    () => {
      trackPNOptInMessageOpened();
      trackPNOptInMessageCTADisplaySuccess();
    },
    () => pnOptInMessageInfo.isPNOptInMessage
  );

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
            paymentId: paymentToCheckRptId
          })
        );
      }
    }, [dispatch, messageId, messageDetails, store])
  );

  if (message === undefined || messageDetails === undefined) {
    return (
      <OperationResultScreenContent
        pictogram={"umbrellaNew"}
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
                <MessageDetailsTagBox>
                  <Icon
                    name="attachment"
                    accessibilityLabel={I18n.t(
                      "messageDetails.accessibilityAttachmentIcon"
                    )}
                    testID="attachment-tag"
                    size={16}
                  />
                </MessageDetailsTagBox>
              )}
            </MessageDetailsHeader>
            <VSpacer />
            <MessageDetailsReminder
              dueDate={messageDetails.dueDate}
              messageId={messageId}
              title={subject}
            />
            <MessageMarkdown
              onLoadEnd={() => {
                setTimeout(() => {
                  setAccessibilityFocus(scrollViewRef);
                }, 100);
              }}
            >
              {markdownWithNoCTA}
            </MessageMarkdown>
            <MessageDetailsPayment messageId={messageId} />
            <VSpacer size={16} />
            <MessageDetailsAttachments messageId={messageId} />
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
      />
    </>
  );
};
