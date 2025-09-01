import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { useCallback, useEffect } from "react";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import I18n from "../../../i18n";
import { useIODispatch, useIOSelector, useIOStore } from "../../../store/hooks";
import { profileFiscalCodeSelector } from "../../settings/common/store/selectors";
import { isStrictSome } from "../../../utils/pot";
import {
  cancelPreviousAttachmentDownload,
  cancelQueuedPaymentUpdates,
  updatePaymentForMessage
} from "../../messages/store/actions";
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
  messageId: string;
  serviceId: ServiceId;
  firstTimeOpening: boolean;
};

type MessageDetailsRouteProps = RouteProp<
  PnParamsList,
  "PN_ROUTES_MESSAGE_DETAILS"
>;

export const MessageDetailsScreen = () => {
  const dispatch = useIODispatch();
  const route = useRoute<MessageDetailsRouteProps>();

  const { messageId, serviceId, firstTimeOpening } = route.params;

  const currentFiscalCode = useIOSelector(profileFiscalCodeSelector);
  const messagePot = useIOSelector(state =>
    pnMessageFromIdSelector(state, messageId)
  );
  const payments = paymentsFromPNMessagePot(currentFiscalCode, messagePot);
  const paymentsCount = payments?.length ?? 0;

  useHeaderSecondLevel({
    title: "",
    supportRequest: true
  });

  useEffect(() => {
    dispatch(startPNPaymentStatusTracking(messageId));

    if (isStrictSome(messagePot)) {
      const isCancelled = isCancelledFromPNMessagePot(messagePot);
      const containsF24 = containsF24FromPNMessagePot(messagePot);

      trackPNUxSuccess(
        paymentsCount,
        firstTimeOpening,
        isCancelled,
        containsF24
      );
    }
    return () => {
      dispatch(cancelPreviousAttachmentDownload());
      dispatch(cancelQueuedPaymentUpdates({ messageId }));
      dispatch(cancelPNPaymentStatusTracking());
    };
  }, [dispatch, firstTimeOpening, messageId, messagePot, paymentsCount]);

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
