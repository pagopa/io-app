import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute
} from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { useCallback } from "react";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import I18n from "../../../i18n";
import { useIODispatch, useIOSelector, useIOStore } from "../../../store/hooks";
import { profileFiscalCodeSelector } from "../../../store/reducers/profile";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { isStrictSome } from "../../../utils/pot";
import {
  cancelPreviousAttachmentDownload,
  cancelQueuedPaymentUpdates,
  updatePaymentForMessage
} from "../../messages/store/actions";
import { UIMessageId } from "../../messages/types";
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

export type MessageDetailsScreenRouteParams = {
  messageId: UIMessageId;
  serviceId: ServiceId;
  firstTimeOpening: boolean;
};

type MessageDetailsRouteProps = RouteProp<
  PnParamsList,
  "PN_ROUTES_MESSAGE_DETAILS"
>;

export const MessageDetailsScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useNavigation();
  const route = useRoute<MessageDetailsRouteProps>();

  const { messageId, serviceId, firstTimeOpening } = route.params;

  const currentFiscalCode = useIOSelector(profileFiscalCodeSelector);
  const messagePot = useIOSelector(state =>
    pnMessageFromIdSelector(state, messageId)
  );
  const payments = paymentsFromPNMessagePot(currentFiscalCode, messagePot);

  const goBack = useCallback(() => {
    dispatch(cancelPreviousAttachmentDownload());
    dispatch(cancelQueuedPaymentUpdates());
    dispatch(cancelPNPaymentStatusTracking());
    navigation.goBack();
  }, [dispatch, navigation]);

  useHeaderSecondLevel({
    title: "",
    goBack,
    supportRequest: true
  });

  useOnFirstRender(() => {
    dispatch(startPNPaymentStatusTracking(messageId));

    if (isStrictSome(messagePot)) {
      const paymentCount = payments?.length ?? 0;
      const isCancelled = isCancelledFromPNMessagePot(messagePot);
      const containsF24 = containsF24FromPNMessagePot(messagePot);

      trackPNUxSuccess(
        paymentCount,
        firstTimeOpening,
        isCancelled,
        containsF24
      );
    }
  });

  const store = useIOStore();
  useFocusEffect(
    useCallback(() => {
      const globalState = store.getState();
      const paymentToCheckRptId = pnUserSelectedPaymentRptIdSelector(
        globalState,
        messagePot
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
    }, [dispatch, messageId, messagePot, serviceId, store])
  );

  return (
    <>
      {pipe(
        messagePot,
        pot.toOption,
        O.flatten,
        O.fold(
          () => (
            <OperationResultScreenContent
              pictogram="umbrella"
              title={I18n.t("features.pn.details.loadError.title")}
              subtitle={I18n.t("features.pn.details.loadError.body")}
            />
          ),
          message => (
            <MessageDetails
              message={message}
              messageId={messageId}
              serviceId={serviceId}
              payments={payments}
            />
          )
        )
      )}
    </>
  );
};
