import { Option, some } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { ActionType } from "typesafe-actions";

import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import {
  navigateToPaymentConfirmPaymentMethodScreen,
  navigateToPaymentPickPaymentMethodScreen,
  navigateToPaymentPickPspScreen,
  navigateToWalletAddPaymentMethod
} from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import {
  paymentFetchPspsForPaymentId,
  paymentUpdateWalletPsp,
  pspForPaymentV2WithCallbacks
} from "../../../store/actions/wallet/payment";
import { isRawPayPal, Psp, Wallet } from "../../../types/pagopa";
import {
  pspsForLocale,
  walletHasFavoriteAvailablePsp
} from "../../../utils/payment";
import { getPayPalPspIconUrl } from "../../../utils/paymentMethod";

/**
 * Common action dispatchers for payment screens
 */
export const dispatchUpdatePspForWalletAndConfirm =
  (dispatch: Dispatch) =>
  (
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
      paymentUpdateWalletPsp.request({
        idPsp,
        wallet,
        onSuccess: (
          action: ActionType<typeof paymentUpdateWalletPsp["success"]>
        ) => {
          const psp = action.payload.updatedWallet.psp;
          if (psp !== undefined) {
            dispatch(paymentFetchPspsForPaymentId.success([psp]));
          }

          navigateToPaymentConfirmPaymentMethodScreen({
            rptId,
            initialAmount,
            verifica,
            idPayment,
            wallet: action.payload.updatedWallet, // the updated wallet
            psps
          });
        },
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
export const dispatchPickPspOrConfirm =
  (dispatch: Dispatch) =>
  (
    rptId: RptId,
    initialAmount: AmountInEuroCents,
    verifica: PaymentRequestsGetResponse,
    idPayment: string,
    maybeSelectedWallet: Option<Wallet>,
    // NO_PSPS_AVAILABLE: the wallet cannot be used for this payment
    // FETCH_PSPS_FAILURE: fetching the PSPs for this wallet has failed
    onFailure: (reason: "NO_PSPS_AVAILABLE" | "FETCH_PSPS_FAILURE") => void,
    hasWallets: boolean = true
    // eslint-disable-next-line sonarjs/cognitive-complexity
  ) => {
    if (maybeSelectedWallet.isSome()) {
      const selectedWallet = maybeSelectedWallet.value;
      // if the paying method is paypal retrieve psp from new API
      // see https://pagopa.atlassian.net/wiki/spaces/IOAPP/pages/445844411/Modifiche+al+flusso+di+pagamento
      if (isRawPayPal(selectedWallet.paymentMethod)) {
        dispatch(
          pspForPaymentV2WithCallbacks({
            idPayment,
            idWallet: selectedWallet.idWallet,
            onFailure: () => onFailure("FETCH_PSPS_FAILURE"),
            onSuccess: pspList => {
              if (pspList.length === 0) {
                onFailure("NO_PSPS_AVAILABLE");
                return;
              }
              navigateToPaymentConfirmPaymentMethodScreen({
                rptId,
                initialAmount,
                verifica,
                idPayment,
                psps: pspList.map<Psp>(p => ({
                  id: parseInt(p.idPsp, 10),
                  logoPSP: getPayPalPspIconUrl(p.codiceAbi),
                  fixedCost: {
                    currency: "EUR",
                    amount: p.fee,
                    decimalDigits: 2
                  }
                })),
                wallet: maybeSelectedWallet.value
              });
            }
          })
        );
      } else {
        // credit card
        // the user has selected a wallet (either because it was the favourite one
        // or because he just added a new card he wants to use for the payment), so
        // there's no need to ask to select a wallet - we can ask pagopa for the
        // PSPs that we can use with this wallet.
        dispatch(
          paymentFetchPspsForPaymentId.request({
            idPayment,
            idWallet: selectedWallet.idWallet,
            onFailure: () => onFailure("FETCH_PSPS_FAILURE"),
            onSuccess: successAction => {
              // filter PSPs for the current locale only (the list will contain
              // duplicates for all the supported languages)
              const psps = pspsForLocale(successAction.payload);
              if (psps.length === 0) {
                // this payment method cannot be used!
                onFailure("NO_PSPS_AVAILABLE");
              } else if (walletHasFavoriteAvailablePsp(selectedWallet, psps)) {
                // The user already selected a psp in the past for this wallet, and
                // that PSP can be used for this payment, in this case we can
                // proceed to the confirmation screen

                navigateToPaymentConfirmPaymentMethodScreen({
                  rptId,
                  initialAmount,
                  verifica,
                  idPayment,
                  psps,
                  wallet: maybeSelectedWallet.value
                });
              } else if (psps.length === 1) {
                // there is only one PSP available for this payment, we can go ahead
                // and associate it to the current wallet without asking the user to
                // select it
                dispatchUpdatePspForWalletAndConfirm(dispatch)(
                  psps[0].id,
                  selectedWallet,
                  rptId,
                  initialAmount,
                  verifica,
                  idPayment,
                  psps,
                  () =>
                    // associating the only available psp to the wallet has failed, go
                    // to the psp selection screen anyway

                    navigateToPaymentPickPspScreen({
                      rptId,
                      initialAmount,
                      verifica,
                      wallet: selectedWallet,
                      psps,
                      idPayment
                    })
                );
              } else {
                // we have more than one PSP and we cannot select one automatically,
                // ask the user to select one PSP

                navigateToPaymentPickPspScreen({
                  rptId,
                  initialAmount,
                  verifica,
                  wallet: selectedWallet,
                  psps,
                  idPayment
                });
              }
            }
          })
        );
      }
    } else {
      if (hasWallets) {
        // the user didn't select yet a wallet, ask the user to select one

        navigateToPaymentPickPaymentMethodScreen({
          rptId,
          initialAmount,
          verifica,
          idPayment
        });
      } else {
        // the user never add a wallet, ask the user to add a new one

        navigateToWalletAddPaymentMethod({
          inPayment: some({
            rptId,
            initialAmount,
            verifica,
            idPayment
          })
        });
      }
    }
  };
