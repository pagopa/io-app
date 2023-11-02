import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useStore } from "react-redux";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { ServicePublic } from "../../../../definitions/backend/ServicePublic";
import I18n from "../../../i18n";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { UIMessageId } from "../../../store/reducers/entities/messages/types";
import { serviceByIdSelector } from "../../../store/reducers/entities/services/servicesById";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { MessageLoading } from "../../messages/components/MessageLoading";
import { loadThirdPartyMessage } from "../../messages/store/actions";
import { MessageDetails } from "../components/MessageDetails";
import { PnMessageDetailsError } from "../components/PnMessageDetailsError";
import { PnParamsList } from "../navigation/params";
import { pnMessageFromIdSelector } from "../store/reducers";
import { PNMessage } from "../store/types/types";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { cancelPreviousAttachmentDownload } from "../../../store/actions/messages";
import { profileFiscalCodeSelector } from "../../../store/reducers/profile";
import {
  isCancelledFromPNMessagePot,
  paymentsFromPNMessagePot
} from "../utils";
import { trackPNUxSuccess } from "../analytics";
import { isStrictSome } from "../../../utils/pot";
import {
  cancelQueuedPaymentUpdates,
  clearSelectedPayment,
  updatePaymentForMessage
} from "../store/actions";
import { GlobalState } from "../../../store/reducers/types";
import { selectedPaymentIdSelector } from "../store/reducers/payments";

export type PnMessageDetailsScreenNavigationParams = Readonly<{
  messageId: UIMessageId;
  serviceId: ServiceId;
  firstTimeOpening: boolean;
}>;

const renderMessage = (
  messageId: UIMessageId,
  messagePot: pot.Pot<O.Option<PNMessage>, Error>,
  service: ServicePublic | undefined,
  payments: ReadonlyArray<NotificationPaymentInfo> | undefined,
  onRetry: () => void
) =>
  pot.fold(
    messagePot,
    () => <></>,
    () => <MessageLoading />,
    () => <MessageLoading />,
    () => <PnMessageDetailsError onRetry={onRetry} />,
    messageOption =>
      O.isSome(messageOption) ? (
        <MessageDetails
          messageId={messageId}
          message={messageOption.value}
          service={service}
          payments={payments}
        />
      ) : (
        // decoding error
        <PnMessageDetailsError onRetry={onRetry} />
      ),
    () => <MessageLoading />,
    () => <></>,
    () => <></>
  );

export const MessageDetailsScreen = (
  props: IOStackNavigationRouteProps<PnParamsList, "PN_ROUTES_MESSAGE_DETAILS">
): React.ReactElement => {
  // console.log(`=== Screen: rendering`);
  const { messageId, serviceId, firstTimeOpening } = props.route.params;

  const dispatch = useIODispatch();
  const navigation = useNavigation();
  const uxEventTracked = React.useRef(false);

  const service = pot.toUndefined(
    useIOSelector(state => serviceByIdSelector(serviceId)(state)) ?? pot.none
  );

  const currentFiscalCode = useIOSelector(profileFiscalCodeSelector);
  const message = useIOSelector(state =>
    pnMessageFromIdSelector(state, messageId)
  );
  const payments = paymentsFromPNMessagePot(currentFiscalCode, message);

  const loadContent = React.useCallback(() => {
    dispatch(loadThirdPartyMessage.request(messageId));
  }, [dispatch, messageId]);

  const customGoBack = React.useCallback(() => {
    dispatch(cancelPreviousAttachmentDownload());
    dispatch(cancelQueuedPaymentUpdates());
    navigation.goBack();
  }, [dispatch, navigation]);

  useOnFirstRender(() => {
    loadContent();
  });

  if (!uxEventTracked.current && isStrictSome(message)) {
    // eslint-disable-next-line functional/immutable-data
    uxEventTracked.current = true;
    const paymentCount = payments?.length ?? 0;
    const isCancelled = isCancelledFromPNMessagePot(message);
    trackPNUxSuccess(paymentCount, firstTimeOpening, isCancelled);
  }

  const store = useStore();
  useFocusEffect(
    React.useCallback(() => {
      const globalState = store.getState() as GlobalState;
      const selectedPaymentId = selectedPaymentIdSelector(globalState);
      if (selectedPaymentId) {
        // console.log(`=== Screen: requesting last payment`);
        dispatch(clearSelectedPayment());
        dispatch(
          updatePaymentForMessage.request({
            messageId,
            paymentId: selectedPaymentId
          })
        );
      }
    }, [dispatch, messageId, store])
  );

  return (
    <BaseScreenComponent
      goBack={customGoBack}
      headerTitle={I18n.t("features.pn.details.title")}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        {renderMessage(messageId, message, service, payments, loadContent)}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
