import { AmountInEuroCents, RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import * as O from "fp-ts/lib/Option";
import { ActionType } from "typesafe-actions";

import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { Config } from "../../../../definitions/content/Config";
import { PspData } from "../../../../definitions/pagopa/PspData";
import { POSTE_DATAMATRIX_SCAN_PREFERRED_PSPS } from "../../../config";
import {
  navigateToPaymentConfirmPaymentMethodScreen,
  navigateToPaymentPickPaymentMethodScreen,
  navigateToPaymentPickPspScreen,
  navigateToWalletAddPaymentMethod
} from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import {
  PaymentStartOrigin,
  paymentUpdateWalletPsp,
  pspForPaymentV2WithCallbacks,
  pspSelectedForPaymentV2
} from "../../../store/actions/wallet/payment";
import { isRawPayPal, Wallet } from "../../../types/pagopa";
import { walletHasFavoriteAvailablePspData } from "../../../utils/payment";

/**
 * If needed, filter the PSPs list by the preferred PSPs.
 * Preferred PSPs could be defined remotely with a local fallback.
 * Remote configuration has priority over local configuration.
 */
export const filterPspsByPreferredPsps = (
  pspList: ReadonlyArray<PspData>,
  remotePreferredPsps: ReadonlyArray<string> | undefined,
  fallbackPreferredPsps: ReadonlyArray<string> | undefined
): ReadonlyArray<PspData> => {
  const preferredPsps = remotePreferredPsps ?? fallbackPreferredPsps;

  // If preferredPsps is undefined or empty we return the original list
  // because we don't have any filter to apply
  if (preferredPsps === undefined || preferredPsps.length === 0) {
    return pspList;
  }

  // The list of filtered PSPs
  const filteredPsps = pspList.filter(psp => preferredPsps.includes(psp.idPsp));

  // If we have filtered PSPs we return them, otherwise we return the original list
  return filteredPsps.length > 0 ? filteredPsps : pspList;
};

/**
 * Filter the PSPs list by the payment start origin.
 */
const filterPspsByPaymentStartOrigin = (
  paymentsStartOrigin: PaymentStartOrigin,
  preferredPspsByOrigin: NonNullable<
    Config["payments"]["preferredPspsByOrigin"]
  >,
  pspList: ReadonlyArray<PspData>
) => {
  switch (paymentsStartOrigin) {
    case "poste_datamatrix_scan":
      return filterPspsByPreferredPsps(
        pspList,
        preferredPspsByOrigin.poste_datamatrix_scan,
        POSTE_DATAMATRIX_SCAN_PREFERRED_PSPS
      );

    default:
      return pspList;
  }
};

export const getFilteredPspsList = (
  allPsps: ReadonlyArray<PspData>,
  paymentStartOrigin?: PaymentStartOrigin,
  preferredPspsByOrigin?: Config["payments"]["preferredPspsByOrigin"]
) => {
  // If necessary, filter the PSPs list by the payment start origin
  if (paymentStartOrigin !== undefined && preferredPspsByOrigin !== undefined) {
    return filterPspsByPaymentStartOrigin(
      paymentStartOrigin,
      preferredPspsByOrigin,
      allPsps
    );
  }
  return allPsps;
};

/**
 * Common action dispatchers for payment screens
 */
export const dispatchUpdatePspForWalletAndConfirm =
  (dispatch: Dispatch) =>
  (
    psp: PspData,
    wallet: Wallet,
    rptId: RptId,
    initialAmount: AmountInEuroCents,
    verifica: PaymentRequestsGetResponse,
    idPayment: string,
    psps: ReadonlyArray<PspData>,
    onFailure: () => void
  ) =>
    dispatch(
      paymentUpdateWalletPsp.request({
        psp,
        wallet,
        idPayment,
        onSuccess: (
          action: ActionType<typeof paymentUpdateWalletPsp["success"]>
        ) => {
          if (psp !== undefined) {
            dispatch(pspSelectedForPaymentV2(psp));
          }
          navigateToPaymentConfirmPaymentMethodScreen({
            rptId,
            initialAmount,
            verifica,
            idPayment,
            wallet: { ...wallet, psp: action.payload.updatedWallet.psp }, // the updated wallet
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
    maybeSelectedWallet: O.Option<Wallet>,
    // NO_PSPS_AVAILABLE: the wallet cannot be used for this payment
    // FETCH_PSPS_FAILURE: fetching the PSPs for this wallet has failed
    onFailure: (reason: "NO_PSPS_AVAILABLE" | "FETCH_PSPS_FAILURE") => void,
    hasWallets: boolean = true
    // eslint-disable-next-line sonarjs/cognitive-complexity
  ) => {
    if (O.isSome(maybeSelectedWallet)) {
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
                // there should exists only 1 psp that can handle Paypal transactions
                psps: pspList.filter(pd => pd.defaultPsp),
                wallet: maybeSelectedWallet.value
              });
            }
          })
        );
      } else {
        // credit card or bpay
        // the user has selected a wallet (either because it was the favourite one
        // or because he just added a new card he wants to use for the payment), so
        // there's no need to ask to select a wallet - we can ask pagopa for the
        // PSPs that we can use with this wallet.
        dispatch(
          pspForPaymentV2WithCallbacks({
            idPayment,
            idWallet: selectedWallet.idWallet,
            onFailure: () => onFailure("FETCH_PSPS_FAILURE"),
            onSuccess: pspList => {
              const eligiblePsp = pspList.find(p => p.defaultPsp);
              if (pspList.length === 0) {
                // this payment method cannot be used!
                onFailure("NO_PSPS_AVAILABLE");
              } else if (
                walletHasFavoriteAvailablePspData(selectedWallet, pspList)
              ) {
                // The user already selected a psp in the past for this wallet, and
                // that PSP can be used for this payment, in this case we can
                // proceed to the confirmation screen
                navigateToPaymentConfirmPaymentMethodScreen({
                  rptId,
                  initialAmount,
                  verifica,
                  idPayment,
                  psps: pspList,
                  wallet: maybeSelectedWallet.value
                });
              } else if (eligiblePsp) {
                // there is only one PSP available for this payment, we can go ahead
                // and associate it to the current wallet without asking the user to
                // select it
                dispatchUpdatePspForWalletAndConfirm(dispatch)(
                  eligiblePsp,
                  selectedWallet,
                  rptId,
                  initialAmount,
                  verifica,
                  idPayment,
                  pspList,
                  () =>
                    // associating the only available psp to the wallet has failed, go
                    // to the psp selection screen anyway

                    navigateToPaymentPickPspScreen({
                      rptId,
                      initialAmount,
                      verifica,
                      wallet: selectedWallet,
                      psps: pspList,
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
                  psps: pspList,
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
          inPayment: O.some({
            rptId,
            initialAmount,
            verifica,
            idPayment
          })
        });
      }
    }
  };
