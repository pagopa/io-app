import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { useCallback, useEffect } from "react";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector, useIOStore } from "../../../store/hooks";
import { isTestEnv } from "../../../utils/environment";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { isStrictSome } from "../../../utils/pot";
import {
  cancelPreviousAttachmentDownload,
  cancelQueuedPaymentUpdates,
  updatePaymentForMessage
} from "../../messages/store/actions";
import { isThirdParyMessageAarSelector } from "../../messages/store/reducers/thirdPartyById";
import { profileFiscalCodeSelector } from "../../settings/common/store/selectors";
import { useSendAarFlowManager } from "../aar/hooks/useSendAarFlowManager";
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
import { PNMessage } from "../store/types/types";
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

type BaseMessageDetailsScreenProps = {
  messageId: string;
  serviceId: ServiceId;
  messagePot: pot.Pot<O.Option<PNMessage>, Error>;
  payments: ReadonlyArray<NotificationPaymentInfo> | undefined;
};
type EphemeralAarMessageDetailsScreenType = {
  messageId: string;
  serviceId: ServiceId;
};
type MessageDetailsRouteProps = RouteProp<
  PnParamsList,
  "PN_ROUTES_MESSAGE_DETAILS"
>;

export const MessageDetailsScreen = () => {
  const route = useRoute<MessageDetailsRouteProps>();
  const { messageId, serviceId, firstTimeOpening } = route.params;
  const isAar = useIOSelector(state =>
    isThirdParyMessageAarSelector(state, messageId)
  );
  return isAar ? (
    <EphemeralAarMessageDetailsScreen
      messageId={messageId}
      serviceId={serviceId}
    />
  ) : (
    <StandardMessageDetailsScreen
      messageId={messageId}
      serviceId={serviceId}
      firstTimeOpening={firstTimeOpening}
    />
  );
};

const EphemeralAarMessageDetailsScreen = (
  props: EphemeralAarMessageDetailsScreenType
) => {
  const { setOptions } = useIONavigation();
  const { terminateFlow } = useSendAarFlowManager();

  const { messageId, serviceId } = props;

  const currentFiscalCode = useIOSelector(profileFiscalCodeSelector);
  const messagePot = useIOSelector(state =>
    pnMessageFromIdSelector(state, messageId)
  );
  const payments = paymentsFromPNMessagePot(currentFiscalCode, messagePot);

  useOnFirstRender(() => {
    setOptions({
      header: () => (
        <HeaderSecondLevel
          type="singleAction"
          firstAction={{
            icon: "closeLarge",
            onPress: terminateFlow,
            accessibilityLabel: I18n.t("global.buttons.close")
          }}
          title=""
        />
      )
    });
  });

  return (
    <BaseMessageDetailsScreen
      messageId={messageId}
      messagePot={messagePot}
      serviceId={serviceId}
      payments={payments}
    />
  );
};

const StandardMessageDetailsScreen = ({
  messageId,
  serviceId,
  firstTimeOpening
}: MessageDetailsScreenRouteParams) => {
  const dispatch = useIODispatch();

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

  return (
    <BaseMessageDetailsScreen
      messageId={messageId}
      messagePot={messagePot}
      serviceId={serviceId}
      payments={payments}
    />
  );
};

const BaseMessageDetailsScreen = ({
  messageId,
  messagePot,
  serviceId,
  payments
}: BaseMessageDetailsScreenProps) => {
  const dispatch = useIODispatch();
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

  return pipe(
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
  );
};

export const testable = isTestEnv
  ? {
      EphemeralAarMessageDetailsScreen,
      StandardMessageDetailsScreen,
      BaseMessageDetailsScreen
    }
  : undefined;
