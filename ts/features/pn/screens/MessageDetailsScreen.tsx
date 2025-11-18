import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import _ from "lodash";
import { RefObject, useCallback, useEffect, useMemo, useRef } from "react";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { useHardwareBackButton } from "../../../hooks/useHardwareBackButton";
import { useOfflineToastGuard } from "../../../hooks/useOfflineToastGuard";
import { useStartSupportRequest } from "../../../hooks/useStartSupportRequest";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector, useIOStore } from "../../../store/hooks";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import {
  cancelPreviousAttachmentDownload,
  cancelQueuedPaymentUpdates,
  updatePaymentForMessage
} from "../../messages/store/actions";
import {
  SendOpeningSource,
  SendUserType
} from "../../pushNotifications/analytics";
import { profileFiscalCodeSelector } from "../../settings/common/store/selectors";
import {
  trackSendAARFailure,
  trackSendAarNotificationClosure
} from "../aar/analytics";
import { SendAARMessageDetailBottomSheetComponent } from "../aar/components/SendAARMessageDetailBottomSheetComponent";
import { terminateAarFlow } from "../aar/store/actions";
import { sendAARFlowStates } from "../aar/utils/stateUtils";
import { trackPNUxSuccess } from "../analytics";
import { MessageDetails } from "../components/MessageDetails";
import { PnParamsList } from "../navigation/params";
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

export type MessageDetailsScreenRouteParams = {
  messageId: string;
  serviceId: ServiceId;
  firstTimeOpening: boolean | undefined;
} & (
  | {
      sendOpeningSource: Extract<SendOpeningSource, "aar">;
      sendUserType: Extract<SendUserType, "mandatory" | "recipient">;
    }
  | {
      sendOpeningSource: Extract<SendOpeningSource, "message">;
      sendUserType: Extract<SendUserType, "not_set">;
    }
);

type MessageDetailsRouteProps = IOStackNavigationRouteProps<
  PnParamsList,
  "PN_ROUTES_MESSAGE_DETAILS"
>;

const useCorrectHeader = (
  isAAr: boolean,
  aarBottomSheetRef: RefObject<(() => void) | undefined>,
  userType: SendUserType
) => {
  const { setOptions, goBack } = useIONavigation();
  const startSupportRequest = useOfflineToastGuard(useStartSupportRequest({}));

  const aarAction: HeaderSecondLevel = {
    title: "",
    type: "singleAction",
    firstAction: {
      icon: "closeLarge",
      onPress: () => {
        trackSendAarNotificationClosure(userType);
        aarBottomSheetRef.current?.();
      },
      accessibilityLabel: I18n.t("global.buttons.close"),
      testID: "AAR_close_button"
    }
  };
  const supportRequestAction: HeaderSecondLevel = {
    type: "singleAction",
    title: "",
    firstAction: {
      icon: "help",
      onPress: startSupportRequest,
      accessibilityLabel: I18n.t(
        "global.accessibility.contextualHelp.open.label"
      ),
      testID: "support_close_button"
    },
    goBack,
    backAccessibilityLabel: I18n.t("global.buttons.back")
  };
  useOnFirstRender(() => {
    setOptions({
      header: () => (
        <HeaderSecondLevel {...(isAAr ? aarAction : supportRequestAction)} />
      ),
      headerShown: true
    });
  });
};

export const MessageDetailsScreen = ({ route }: MessageDetailsRouteProps) => {
  const dispatch = useIODispatch();
  // Be aware that when this screen displays an AAR message, messageId and IUN have
  // the same value. When displaying SEND's notifications via IO Messages, messageId
  // and IUN have differente values
  const {
    messageId,
    serviceId,
    firstTimeOpening,
    sendOpeningSource,
    sendUserType
  } = route.params;
  const aarBottomSheetRef = useRef<() => void>(undefined);

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
  const androidBackButtonCallback = useCallback(() => {
    if (isAarMessage) {
      trackSendAarNotificationClosure(sendUserType);
      aarBottomSheetRef.current?.();
      return true;
    }
    return false;
  }, [isAarMessage, sendUserType]);

  useHardwareBackButton(androidBackButtonCallback);
  useCorrectHeader(isAarMessage, aarBottomSheetRef, sendUserType);

  // useEffect for payment tracking and resource dealloaction
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
            currentFlowState: sendAARFlowStates.displayingNotificationData
          })
        );
      }
    };
  }, [dispatch, isAarMessage, messageId, sendOpeningSource, sendUserType]);

  // useEffect for analytics tracking
  useEffect(() => {
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
      trackSendAARFailure(
        "Show Notification",
        "Screen rendering with undefined SEND message"
      );
    }
  }, [
    firstTimeOpening,
    isAarMessage,
    paymentsCount,
    sendMessageOrUndefined,
    sendOpeningSource,
    sendUserType
  ]);

  // useFocusEffect to track and update an user-selected payment
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
        pictogram="umbrella"
        title={I18n.t("features.pn.details.loadError.title")}
        subtitle={I18n.t("features.pn.details.loadError.body")}
        isHeaderVisible={isAarMessage}
      />
    );
  }

  return (
    <>
      <MessageDetails
        message={sendMessageOrUndefined}
        messageId={messageId}
        serviceId={serviceId}
        payments={payments}
        sendOpeningSource={sendOpeningSource}
        sendUserType={sendUserType}
      />
      {isAarMessage && (
        <SendAARMessageDetailBottomSheetComponent
          aarBottomSheetRef={aarBottomSheetRef}
          sendUserType={sendUserType}
        />
      )}
    </>
  );
};
