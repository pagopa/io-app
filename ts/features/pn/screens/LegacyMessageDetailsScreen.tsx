import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { SafeAreaView } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useStore } from "react-redux";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import I18n from "../../../i18n";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { serviceByIdSelector } from "../../../store/reducers/entities/services/servicesById";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { LegacyMessageDetails } from "../components/LegacyMessageDetails";
import { PnParamsList } from "../navigation/params";
import { pnMessageFromIdSelector } from "../store/reducers";
import { cancelPreviousAttachmentDownload } from "../../messages/store/actions";
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
  cancelQueuedPaymentUpdates,
  clearSelectedPayment,
  startPaymentStatusTracking,
  updatePaymentForMessage
} from "../store/actions";
import { GlobalState } from "../../../store/reducers/types";
import { selectedPaymentIdSelector } from "../store/reducers/payments";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../components/infoScreen/imageRendering";
import genericErrorIcon from "../../../../img/wallet/errors/generic-error-icon.png";

export const LegacyMessageDetailsScreen = (
  props: IOStackNavigationRouteProps<PnParamsList, "PN_ROUTES_MESSAGE_DETAILS">
): React.ReactElement => {
  const { messageId, serviceId, firstTimeOpening } = props.route.params;

  const dispatch = useIODispatch();
  const navigation = useNavigation();

  const service = pot.toUndefined(
    useIOSelector(state => serviceByIdSelector(state, serviceId))
  );

  const currentFiscalCode = useIOSelector(profileFiscalCodeSelector);
  const messagePot = useIOSelector(state =>
    pnMessageFromIdSelector(state, messageId)
  );
  const payments = paymentsFromPNMessagePot(currentFiscalCode, messagePot);

  const customGoBack = React.useCallback(() => {
    dispatch(cancelPreviousAttachmentDownload());
    dispatch(cancelQueuedPaymentUpdates());
    dispatch(cancelPaymentStatusTracking());
    navigation.goBack();
  }, [dispatch, navigation]);

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

  const store = useStore();
  useFocusEffect(
    React.useCallback(() => {
      const globalState = store.getState() as GlobalState;
      const selectedPaymentId = selectedPaymentIdSelector(globalState);
      if (selectedPaymentId) {
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
        {pipe(
          messagePot,
          pot.toOption,
          O.flatten,
          O.fold(
            () => (
              <InfoScreenComponent
                image={renderInfoRasterImage(genericErrorIcon)}
                title={I18n.t("features.pn.details.loadError.title")}
                body={I18n.t("features.pn.details.loadError.body")}
              />
            ),
            message => (
              <LegacyMessageDetails
                messageId={messageId}
                message={message}
                service={service}
                payments={payments}
              />
            )
          )
        )}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
