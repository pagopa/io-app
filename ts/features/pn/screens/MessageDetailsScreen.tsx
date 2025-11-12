import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { RefObject, useCallback, useEffect, useRef } from "react";
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
import { isStrictSome } from "../../../utils/pot";
import {
  cancelPreviousAttachmentDownload,
  cancelQueuedPaymentUpdates,
  updatePaymentForMessage
} from "../../messages/store/actions";
import { profileFiscalCodeSelector } from "../../settings/common/store/selectors";
import { SendAARMessageDetailBottomSheetComponent } from "../aar/components/SendAARMessageDetailBottomSheetComponent";
import { terminateAarFlow } from "../aar/store/actions";
import { trackPNUxSuccess } from "../analytics";
import { MessageDetails } from "../components/MessageDetails";
import { PnParamsList } from "../navigation/params";
import {
  cancelPNPaymentStatusTracking,
  startPNPaymentStatusTracking
} from "../store/actions";
import {
  pnMessageFromIdSelector,
  pnUserSelectedPaymentRptIdSelector
} from "../store/reducers";
import {
  containsF24FromPNMessagePot,
  isCancelledFromPNMessagePot,
  openingSourceIsAarMessage,
  paymentsFromPNMessagePot
} from "../utils";
import {
  trackSendAARFailure,
  trackSendAarNotificationClosure
} from "../aar/analytics";
import {
  SendOpeningSource,
  SendUserType
} from "../../pushNotifications/analytics";

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
  const sendMessagePot = useIOSelector(state =>
    pnMessageFromIdSelector(state, messageId)
  );

  const sendMessageOrUndefined = O.getOrElseW(() => undefined)(
    pot.getOrElse(sendMessagePot, O.none)
  );

  const isAarMessage = openingSourceIsAarMessage(sendOpeningSource);
  const fiscalCodeOrUndefined = isAarMessage ? undefined : currentFiscalCode;
  const payments = paymentsFromPNMessagePot(
    fiscalCodeOrUndefined,
    sendMessagePot
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

  useEffect(() => {
    dispatch(
      startPNPaymentStatusTracking({
        openingSource: sendOpeningSource,
        userType: sendUserType,
        messageId
      })
    );

    if (isStrictSome(sendMessagePot)) {
      const isCancelled = isCancelledFromPNMessagePot(sendMessagePot);
      const containsF24 = containsF24FromPNMessagePot(sendMessagePot);

      trackPNUxSuccess(
        paymentsCount,
        firstTimeOpening,
        isCancelled,
        containsF24,
        sendOpeningSource,
        sendUserType
      );

      if (sendMessageOrUndefined == null && isAarMessage) {
        trackSendAARFailure(
          "Show Notification",
          "Screen rendering with undefined SEND message"
        );
      }
    }
    return () => {
      dispatch(cancelPreviousAttachmentDownload());
      dispatch(cancelQueuedPaymentUpdates({ messageId }));
      dispatch(cancelPNPaymentStatusTracking());
      if (isAarMessage) {
        dispatch(terminateAarFlow({ messageId }));
      }
    };
  }, [
    dispatch,
    firstTimeOpening,
    isAarMessage,
    messageId,
    paymentsCount,
    sendMessageOrUndefined,
    sendMessagePot,
    sendOpeningSource,
    sendUserType
  ]);

  const store = useIOStore();
  useFocusEffect(
    useCallback(() => {
      const globalState = store.getState();
      const paymentToCheckRptId = pnUserSelectedPaymentRptIdSelector(
        globalState,
        sendMessagePot
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
    }, [dispatch, messageId, sendMessagePot, serviceId, store])
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
