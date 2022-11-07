import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { PaymentInstrument } from "../../../../../../../definitions/pagopa/walletv2/PaymentInstrument";
import { PaymentManagerClient } from "../../../../../../api/pagopa";
import {
  PaymentManagerToken,
  RawPaymentMethod
} from "../../../../../../types/pagopa";
import {
  getGenericError,
  getNetworkError,
  NetworkError
} from "../../../../../../utils/errors";
import { getPaymentMethodHash } from "../../../../../../utils/paymentMethod";
import { SessionManager } from "../../../../../../utils/SessionManager";
import { convertWalletV2toWalletV1 } from "../../../../../../utils/walletv2";

/**
 * Handle the networking logic to add a co-badge card to the wallet
 * @param addCobadgeToWallet http client to execute the request
 * @param sessionManager pm session manager
 * @param paymentInstrument the payload representing the cobadge card to add
 */
export const addCobadgeToWallet = async (
  addCobadgeToWallet: ReturnType<
    typeof PaymentManagerClient
  >["addCobadgeToWallet"],
  sessionManager: SessionManager<PaymentManagerToken>,
  paymentInstrument: PaymentInstrument
): Promise<E.Either<NetworkError, RawPaymentMethod>> => {
  try {
    const addCobadgeToWalletWithRefresh = sessionManager.withRefresh(
      addCobadgeToWallet({
        data: { payload: { paymentInstruments: [paymentInstrument] } }
      })
    );
    const addCobadgeToWalletWithRefreshResult =
      await addCobadgeToWalletWithRefresh();
    if (E.isRight(addCobadgeToWalletWithRefreshResult)) {
      if (addCobadgeToWalletWithRefreshResult.right.status === 200) {
        const wallets = (
          addCobadgeToWalletWithRefreshResult.right.value.data ?? []
        ).map(convertWalletV2toWalletV1);
        // search for the added cobadge.
        const maybeWallet = O.fromNullable(
          wallets.find(
            w =>
              w.paymentMethod &&
              getPaymentMethodHash(w.paymentMethod) === paymentInstrument.hpan
          )
        );
        if (
          O.isSome(maybeWallet) &&
          maybeWallet.value.paymentMethod !== undefined
        ) {
          return E.right(maybeWallet.value.paymentMethod);
        } else {
          return E.left(
            getGenericError(
              new Error(`cannot find added cobadge in wallets list response`)
            )
          );
        }
      } else {
        return E.left(
          getGenericError(
            new Error(
              `response status ${addCobadgeToWalletWithRefreshResult.right.status}`
            )
          )
        );
      }
    } else {
      return E.left(
        getGenericError(
          new Error(readableReport(addCobadgeToWalletWithRefreshResult.left))
        )
      );
    }
  } catch (e) {
    return E.left(getNetworkError(e));
  }
};
