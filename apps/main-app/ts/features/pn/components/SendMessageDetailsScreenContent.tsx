import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { RefObject, useCallback, useEffect, useMemo } from "react";

import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { useIODispatch, useIOSelector, useIOStore } from "../../../store/hooks";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import {
  cancelPreviousAttachmentDownload,
  cancelQueuedPaymentUpdates,
  updatePaymentForMessage
} from "../../messages/store/actions";
import { profileFiscalCodeSelector } from "../../settings/common/store/selectors";
import { trackSendAarFailure } from "../aar/analytics";
import { SendAarMessageDetailBottomSheetComponent } from "../aar/components/SendAarMessageDetailBottomSheetComponent";
import { terminateAarFlow } from "../aar/store/actions";
import { sendAarFlowStates } from "../aar/utils/stateUtils";
import { trackPNUxSuccess } from "../analytics";
import { MessageDetailsScreenRouteParams } from "../screens/MessageDetailsScreen";
import {
  cancelPNPaymentStatusTracking,
  startPNPaymentStatusTracking
} from "../store/actions";
import {
  curriedSendMessageFromIdSelector,
  sendUserSelectedPaymentRptIdSelector
} from "../store/reducers";
import {
  doesSENDMessageIncludeF24,
  isSENDMessageCancelled,
  openingSourceIsAarMessage,
  paymentsFromSendMessage
} from "../utils";
import { MessageDetails } from "./MessageDetails";

type SendMessageDetailsScreenContentProps = MessageDetailsScreenRouteParams & {
  /** Set only for AAR messages, which ask for confirmation before closing. */
  aarBottomSheetRef?: RefObject<(() => void) | undefined>;
};

/**
 * Content of a SEND message, opened either from the IO inbox or by scanning an
 * AAR. The screen showing it is in charge of the header.
 */
export const SendMessageDetailsScreenContent = ({
  aarBottomSheetRef,
  firstTimeOpening,
  messageId,
  sendOpeningSource,
  sendUserType,
  serviceId
}: SendMessageDetailsScreenContentProps) => {
  const dispatch = useIODispatch();
  // Be aware that when this screen displays an AAR message, messageId and IUN have
  // the same value. When displaying SEND's notifications via IO Messages, messageId
  // and IUN have differente values
  const currentFiscalCode = useIOSelector(profileFiscalCodeSelector);
  const sendMessageFromIdSelector = useMemo(
    () => curriedSendMessageFromIdSelector(messageId),
    [messageId]
  );
  const sendMessageOrUndefined = useIOSelector(sendMessageFromIdSelector);

  const isAarMessage = openingSourceIsAarMessage(sendOpeningSource);
  const fiscalCodeOrUndefined = isAarMessage ? undefined : currentFiscalCode;
  const payments = paymentsFromSendMessage(
    fiscalCodeOrUndefined,
    sendMessageOrUndefined
  );
  const paymentsCount = payments?.length ?? 0;

  useEffect(() => {
    dispatch(
      startPNPaymentStatusTracking({
        openingSource: sendOpeningSource,
        userType: sendUserType,
        messageId
      })
    );
    return () => {
      dispatch(cancelPreviousAttachmentDownload());
      dispatch(cancelQueuedPaymentUpdates({ messageId }));
      dispatch(cancelPNPaymentStatusTracking({ messageId }));
      if (isAarMessage) {
        dispatch(
          terminateAarFlow({
            messageId,
            currentFlowState: sendAarFlowStates.displayingNotificationData
          })
        );
      }
    };
  }, [dispatch, isAarMessage, messageId, sendOpeningSource, sendUserType]);

  useOnFirstRender(() => {
    if (sendMessageOrUndefined != null) {
      const isCancelled = isSENDMessageCancelled(sendMessageOrUndefined);
      const containsF24 = doesSENDMessageIncludeF24(sendMessageOrUndefined);

      trackPNUxSuccess(
        paymentsCount,
        firstTimeOpening,
        isCancelled,
        containsF24,
        sendOpeningSource,
        sendUserType
      );
    } else if (isAarMessage) {
      trackSendAarFailure(
        "Show Notification",
        "Screen rendering with undefined SEND message",
        undefined
      );
    }
  });

  const store = useIOStore();
  useFocusEffect(
    useCallback(() => {
      const globalState = store.getState();
      const paymentToCheckRptId = sendUserSelectedPaymentRptIdSelector(
        globalState,
        sendMessageOrUndefined
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
    }, [dispatch, messageId, sendMessageOrUndefined, serviceId, store])
  );

  if (sendMessageOrUndefined == null) {
    return (
      <OperationResultScreenContent
        isHeaderVisible
        pictogram="umbrella"
        subtitle={I18n.t("features.pn.details.loadError.body")}
        title={I18n.t("features.pn.details.loadError.title")}
      />
    );
  }

  return (
    <>
      <MessageDetails
        message={sendMessageOrUndefined}
        messageId={messageId}
        payments={payments}
        sendOpeningSource={sendOpeningSource}
        sendUserType={sendUserType}
        serviceId={serviceId}
      />
      {aarBottomSheetRef && (
        <SendAarMessageDetailBottomSheetComponent
          aarBottomSheetRef={aarBottomSheetRef}
          sendUserType={sendUserType}
        />
      )}
    </>
  );
};
