import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
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
import { profileFiscalCodeSelector } from "../../settings/common/store/selectors";
import { trackSendAARFailure } from "../aar/analytics";
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
  pnUserSelectedPaymentRptIdSelector,
  testingSelector
} from "../store/reducers";
import { paymentsFromPNMessagePot } from "../utils";

export type MessageDetailsScreenRouteParams = {
  messageId: string;
  serviceId: ServiceId;
  firstTimeOpening: boolean;
  isAarMessage?: boolean;
};

type MessageDetailsRouteProps = IOStackNavigationRouteProps<
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

export const MessageDetailsScreen = (props: MessageDetailsRouteProps) => {
  const dispatch = useIODispatch();
  // Be aware that when this screen displays an AAR message, messageId and IUN have
  // the same value. When displaying SEND's notifications via IO Messages, messageId
  // and IUN have differente values
  const { messageId, serviceId, firstTimeOpening, isAarMessage } =
    props.route.params;
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
  // const TPM = useIOSelector(state =>
  //   thirdPartyFromIdSelector(state, messageId)
  // );
  // const sendMessagePot = useMemo(
  //   () => pot.map(TPM, _ => toPNMessage(_)),
  //   [TPM]
  // );

  const mySelector = useMemo(() => testingSelector(messageId), [messageId]);
  const sendMessagePot = useIOSelector(mySelector);

  // useIOSelector(
  //   state => pnMessageFromIdSelector(state, messageId),
  //   {
  //     equalityFn: _.isEqual
  //   }
  // );
  const sendMessageOrUndefined = O.getOrElseW(() => undefined)(
    pot.getOrElse(sendMessagePot, O.none)
  );

  const fiscalCodeOrUndefined = isAarMessage ? undefined : currentFiscalCode;
  const payments = paymentsFromPNMessagePot(
    fiscalCodeOrUndefined,
    sendMessagePot
  );
  const paymentsCount = payments?.length ?? 0;

  console.log(
    `RERENDERING ${isAarMessage ? "AAR" : "STANDARD"}, MSGID:`,
    messageId
  );

  useEffect(() => {
    dispatch(
      startPNPaymentStatusTracking({
        isAARNotification: !!isAarMessage,
        messageId
      })
    );
    return () => {
      dispatch(cancelPreviousAttachmentDownload());
      dispatch(cancelQueuedPaymentUpdates({ messageId }));
      dispatch(cancelPNPaymentStatusTracking({ messageId }));
      if (isAarMessage) {
        console.log("CLEANING AAR, MSGID:", messageId);
        dispatch(terminateAarFlow({ messageId }));
      } else {
        console.log("CLEANING STANDARD, MSGID:", messageId);
      }
    };
  }, [dispatch, isAarMessage, messageId]);

  const isCancelled = sendMessageOrUndefined?.isCancelled ?? false;
  const containsF24 = false;
  useEffect(() => {
    // if (isAarMessage) {
    //   console.log("MOUNTING AAR, MSGID:", messageId);
    // } else {
    //   console.log("MOUNTING STANDARD, MSGID:", messageId);
    // }

    // if (sendMessageOrUndefined != null) {

    console.log("TRACKING Ux, MSGID:", messageId);
    trackPNUxSuccess(paymentsCount, firstTimeOpening, isCancelled, containsF24);

    // if (sendMessageOrUndefined == null && isAarMessage) {
    trackSendAARFailure(
      "Show Notification",
      "Screen rendering with undefined SEND message"
    );
    // }
    // }
  }, [
    containsF24,
    firstTimeOpening,
    isAarMessage,
    isCancelled,
    messageId,
    paymentsCount
  ]);

  useEffect(
    () => () => {
      if (isAarMessage) {
        console.log("UNMOUNT AAR TRIGGERED, MSGID:", messageId);
      } else {
        console.log("UNMOUNT STANDARD TRIGGERED, MSGID:", messageId);
      }
    },
    [messageId, isAarMessage]
  );

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
          iun={messageId}
        />
      )}
    </>
  );
};
