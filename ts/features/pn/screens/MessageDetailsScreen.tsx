import React, { useCallback } from "react";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute
} from "@react-navigation/native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import I18n from "../../../i18n";
import { useIODispatch, useIOSelector, useIOStore } from "../../../store/hooks";
import { UIMessageId } from "../../messages/types";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { MessageDetails } from "../components/MessageDetails";
import { PnParamsList } from "../navigation/params";
import {
  pnMessageFromIdSelector,
  pnUserSelectedPaymentRptIdSelector
} from "../store/reducers";
import {
  cancelPreviousAttachmentDownload,
  cancelQueuedPaymentUpdates,
  updatePaymentForMessage
} from "../../messages/store/actions";
import { profileFiscalCodeSelector } from "../../../store/reducers/profile";
import {
  containsF24FromPNMessagePot,
  isCancelledFromPNMessagePot,
  paymentsFromPNMessagePot
} from "../utils";
import { trackPNUxSuccess } from "../analytics";
import { isStrictSome } from "../../../utils/pot";
import {
  cancelPaymentStatusTracking,
  startPaymentStatusTracking
} from "../store/actions";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";

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
    dispatch(cancelPaymentStatusTracking());
    navigation.goBack();
  }, [dispatch, navigation]);

  useHeaderSecondLevel({
    title: "",
    goBack,
    supportRequest: true
  });

  useOnFirstRender(() => {
    dispatch(startPaymentStatusTracking(messageId));

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
            paymentId: paymentToCheckRptId
          })
        );
      }
    }, [dispatch, messageId, messagePot, store])
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
              pictogram="umbrellaNew"
              title={I18n.t("features.pn.details.loadError.title")}
              subtitle={I18n.t("features.pn.details.loadError.body")}
            />
          ),
          message => (
            <MessageDetails
              message={message}
              serviceId={serviceId}
              payments={payments}
            />
          )
        )
      )}
    </>
  );
};
