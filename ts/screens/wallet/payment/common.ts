// tslint:disable:parameters-max-number

import { Option } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import { ActionType } from "typesafe-actions";

import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import {
  navigateToPaymentConfirmPaymentMethodScreen,
  navigateToPaymentPickPaymentMethodScreen,
  navigateToPaymentPickPspScreen
} from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import {
  paymentFetchPspsForPaymentIdRequest,
  paymentUpdateWalletPspRequest,
  paymentUpdateWalletPspSuccess
} from "../../../store/actions/wallet/payment";
import { Psp, Wallet } from "../../../types/pagopa";
import {
  pspsForLocale,
  walletHasFavoriteAvailablePsp
} from "../../../utils/payment";

/**
 * Common action dispatchers for payment screens
 */
export const dispatchUpdatePspForWalletAndConfirm = (dispatch: Dispatch) => (
  idPsp: number,
  wallet: Wallet,
  rptId: RptId,
  initialAmount: AmountInEuroCents,
  verifica: PaymentRequestsGetResponse,
  idPayment: string,
  psps: ReadonlyArray<Psp>,
  onFailure: () => void
) =>
  dispatch(
    paymentUpdateWalletPspRequest({
      idPsp,
      wallet,
      onSuccess: (action: ActionType<typeof paymentUpdateWalletPspSuccess>) =>
        dispatch(
          navigateToPaymentConfirmPaymentMethodScreen({
            rptId,
            initialAmount,
            verifica,
            idPayment,
            wallet: action.meta, // the updated wallet
            psps
          })
        ),
      onFailure
    })
  );

/**
 * The purpose of this logic is to select a PSP and a Wallet for the payment.
 *
 * This logic gets executed once we have the available PSPs and (optionally) a
 * user preferred o selected Wallet.
 * We get the PSPs after activating the payment (i.e. after we have a paymentId)
 * and we have the Wallet either when the user has a favorite one or when he
 * selects one or when he adds a new one during the payment.
 */
export const dispatchPickPspOrConfirm = (dispatch: Dispatch) => (
  rptId: RptId,
  initialAmount: AmountInEuroCents,
  verifica: PaymentRequestsGetResponse,
  idPayment: string,
  maybeWallet: Option<Wallet>,
  // NO_PSPS_AVAILABLE: the wallet cannot be used for this payment
  // FETCH_PSPS_FAILURE: fetching the PSPs for this wallet has failed
  onFailure: (reason: "NO_PSPS_AVAILABLE" | "FETCH_PSPS_FAILURE") => void
) => {
  if (maybeWallet.isSome()) {
    const wallet = maybeWallet.value;
    // the user has selected a favorite wallet, so no need to ask to
    // select one - we can ask pagopa for the PSPs that we can use with this
    // wallet.
    dispatch(
      paymentFetchPspsForPaymentIdRequest({
        idPayment,
        // provide the idWallet to the getPsps request only if the wallet has
        // a preferred PSP
        idWallet: wallet.psp ? wallet.idWallet : undefined,
        onFailure: () => onFailure("FETCH_PSPS_FAILURE"),
        onSuccess: successAction => {
          // filter PSPs for the current locale only (the list will contain
          // duspliacates for all the supported languages)
          const psps = pspsForLocale(successAction.payload);
          if (psps.length === 0) {
            // this payment method cannot be used!
            onFailure("NO_PSPS_AVAILABLE");
          } else if (walletHasFavoriteAvailablePsp(wallet, psps)) {
            // The user already selected a psp in the past for this wallet, and
            // that PSP can be used for this payment, in this case we can
            // proceed to the confirmation screen
            dispatch(
              navigateToPaymentConfirmPaymentMethodScreen({
                rptId,
                initialAmount,
                verifica,
                idPayment,
                psps,
                wallet: maybeWallet.value
              })
            );
          } else if (psps.length === 1) {
            // there is only one PSP available for this payment, we can go ahead
            // and associate it to the current wallet without asking the user to
            // select it
            dispatchUpdatePspForWalletAndConfirm(dispatch)(
              psps[0].id,
              wallet,
              rptId,
              initialAmount,
              verifica,
              idPayment,
              psps,
              () =>
                // associating the only available psp to the wallet has failed, go
                // to the psp selection screen anyway
                dispatch(
                  navigateToPaymentPickPspScreen({
                    rptId,
                    initialAmount,
                    verifica,
                    wallet,
                    psps,
                    idPayment
                  })
                )
            );
          } else {
            // we have more than one PSP and we cannot select one automatically,
            // ask the user to select one PSP
            dispatch(
              navigateToPaymentPickPspScreen({
                rptId,
                initialAmount,
                verifica,
                wallet,
                psps,
                idPayment
              })
            );
          }
        }
      })
    );
  } else {
    // the user didn't select yet a wallet, ask the user to select one
    dispatch(
      navigateToPaymentPickPaymentMethodScreen({
        rptId,
        initialAmount,
        verifica,
        idPayment
      })
    );
  }
};
