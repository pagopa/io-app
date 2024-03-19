import { AmountInEuroCents, RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { PaymentRequestsGetResponse } from "../../../../../definitions/backend/PaymentRequestsGetResponse";
import { isUndefined } from "../../../../common/model/RemoteValue";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import {
  paymentAttiva,
  paymentCheck,
  paymentIdPolling
} from "../../../../store/actions/wallet/payment";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { withPaymentFeatureSelector } from "../../../../store/reducers/wallet/wallets";
import { Wallet } from "../../../../types/pagopa";
import { alertNoPayablePaymentMethods } from "../../../../utils/paymentMethod";
import { dispatchPickPspOrConfirm } from "../common";

const useStartOrResumePayment = (
  rptId: RptId,
  paymentVerification: O.Option<PaymentRequestsGetResponse>,
  initialAmount: AmountInEuroCents,
  maybeSelectedWallet: O.Option<Wallet>
) => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  const hasPayableMethods =
    useIOSelector(withPaymentFeatureSelector).length > 0;

  const paymentAttivaPot = useIOSelector(_ => _.wallet.payment.attiva);
  const paymentIdPot = useIOSelector(_ => _.wallet.payment.paymentId);
  const paymentCheckPot = useIOSelector(_ => _.wallet.payment.check);
  const pspsRemoteValue = useIOSelector(_ => _.wallet.payment.pspsV2.psps);

  React.useEffect(() => {
    pipe(
      paymentVerification,
      O.map(verifica => {
        if (pot.isNone(paymentAttivaPot)) {
          // If payment activation has not yet been requested, skip
          return;
        }

        if (pot.isNone(paymentIdPot) && !pot.isLoading(paymentIdPot)) {
          // Poll for payment ID
          dispatch(paymentIdPolling.request(verifica));
        }

        if (pot.isSome(paymentIdPot)) {
          const idPayment = paymentIdPot.value;

          // "check" the payment
          if (pot.isNone(paymentCheckPot) && !pot.isLoading(paymentCheckPot)) {
            dispatch(paymentCheck.request(idPayment));
          }

          if (pot.isSome(paymentCheckPot) && isUndefined(pspsRemoteValue)) {
            // Navigate to method or PSP selection screen
            dispatchPickPspOrConfirm(dispatch)(
              rptId,
              initialAmount,
              verifica,
              idPayment,
              maybeSelectedWallet,
              () => {
                // either we cannot use the default payment method for this
                // payment, or fetching the PSPs for this payment and the
                // default wallet has failed, ask the user to pick a wallet
                navigation.navigate(ROUTES.WALLET_NAVIGATOR, {
                  screen: ROUTES.PAYMENT_PICK_PAYMENT_METHOD,
                  params: {
                    rptId,
                    initialAmount,
                    verifica,
                    idPayment
                  }
                });
              },
              hasPayableMethods
            );
          }
        }
      })
    );
  }, [
    dispatch,
    navigation,
    paymentVerification,
    paymentAttivaPot,
    paymentIdPot,
    paymentCheckPot,
    hasPayableMethods,
    pspsRemoteValue,
    rptId,
    initialAmount,
    maybeSelectedWallet
  ]);

  return React.useCallback(() => {
    if (!hasPayableMethods) {
      alertNoPayablePaymentMethods(() =>
        navigation.navigate(ROUTES.WALLET_NAVIGATOR, {
          screen: ROUTES.WALLET_ADD_PAYMENT_METHOD,
          params: {
            inPayment: O.none,
            showOnlyPayablePaymentMethods: true
          }
        })
      );

      return;
    }

    pipe(
      paymentVerification,
      O.map(verifica =>
        dispatch(
          paymentAttiva.request({
            rptId,
            verifica
          })
        )
      )
    );
  }, [dispatch, navigation, hasPayableMethods, rptId, paymentVerification]);
};

export { useStartOrResumePayment };
