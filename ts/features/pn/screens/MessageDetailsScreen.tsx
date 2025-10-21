import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { RefObject, useCallback, useEffect, useRef } from "react";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { useHardwareBackButton } from "../../../hooks/useHardwareBackButton";
import { useOfflineToastGuard } from "../../../hooks/useOfflineToastGuard";
import { useStartSupportRequest } from "../../../hooks/useStartSupportRequest";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
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
  paymentsFromPNMessagePot
} from "../utils";
import { isAarMessageDelegatedSelector } from "../aar/store/selectors";
import { trackSendAARFailure } from "../aar/analytics";

export type MessageDetailsScreenRouteParams = {
  messageId: string;
  serviceId: ServiceId;
  firstTimeOpening: boolean | undefined;
  isAarMessage?: boolean;
};

type MessageDetailsRouteProps = RouteProp<
  PnParamsList,
  "PN_ROUTES_MESSAGE_DETAILS"
>;

const useCorrectHeader = (
  isAAr: boolean,
  aarBottomSheetRef: RefObject<(() => void) | undefined>
) => {
  const { setOptions, goBack } = useIONavigation();
  const startSupportRequest = useOfflineToastGuard(useStartSupportRequest({}));

  const aarAction: HeaderSecondLevel = {
    title: "",
    type: "singleAction",
    firstAction: {
      icon: "closeLarge",
      onPress: () => {
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
      )
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

export const MessageDetailsScreen = () => {
  const dispatch = useIODispatch();
  const route = useRoute<MessageDetailsRouteProps>();
  // Be aware that when this screen displays an AAR message, messageId and IUN have
  // the same value. When displaying SEND's notifications via IO Messages, messageId
  // and IUN have differente values
  const { messageId, serviceId, firstTimeOpening, isAarMessage } = route.params;
  const aarBottomSheetRef = useRef<() => void>(undefined);

  useCorrectHeader(!!isAarMessage, aarBottomSheetRef);

  const androidBackButtonCallback = useCallback(() => {
    if (isAarMessage) {
      aarBottomSheetRef.current?.();
      return true;
    }
    return false;
  }, [isAarMessage]);

  useHardwareBackButton(androidBackButtonCallback);

  const currentFiscalCode = useIOSelector(profileFiscalCodeSelector);
  const sendMessagePot = useIOSelector(state =>
    pnMessageFromIdSelector(state, messageId)
  );
  const isAARDelegate = useIOSelector(state =>
    isAarMessageDelegatedSelector(state, messageId)
  );
  const sendMessageOrUndefined = O.getOrElseW(() => undefined)(
    pot.getOrElse(sendMessagePot, O.none)
  );

  const fiscalCodeOrUndefined = isAarMessage ? undefined : currentFiscalCode;
  const payments = paymentsFromPNMessagePot(
    fiscalCodeOrUndefined,
    sendMessagePot
  );
  const paymentsCount = payments?.length ?? 0;

  useEffect(() => {
    dispatch(
      startPNPaymentStatusTracking({
        isAARNotification: !!isAarMessage,
        messageId
      })
    );

    if (isStrictSome(sendMessagePot)) {
      const isCancelled = isCancelledFromPNMessagePot(sendMessagePot);
      const containsF24 = containsF24FromPNMessagePot(sendMessagePot);
      const openingSource = isAarMessage ? "aar" : "message";
      const userType = !isAarMessage
        ? "not_set"
        : isAARDelegate
        ? "mandatory"
        : "recipient";

      trackPNUxSuccess(
        paymentsCount,
        firstTimeOpening,
        isCancelled,
        containsF24,
        openingSource,
        userType
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
    isAARDelegate,
    isAarMessage,
    messageId,
    paymentsCount,
    sendMessageOrUndefined,
    sendMessagePot
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
        isAARMessage={isAarMessage}
      />
      {isAarMessage && (
        <SendAARMessageDetailBottomSheetComponent
          aarBottomSheetRef={aarBottomSheetRef}
          isDelegate={isAARDelegate}
        />
      )}
    </>
  );
};
