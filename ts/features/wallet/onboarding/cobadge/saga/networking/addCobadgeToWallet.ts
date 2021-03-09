import { Either, left, right } from "fp-ts/lib/Either";
import { fromNullable } from "fp-ts/lib/Option";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { PaymentInstrument } from "../../../../../../../definitions/pagopa/walletv2/PaymentInstrument";
import { PaymentManagerClient } from "../../../../../../api/pagopa";
import {
  isRawCreditCard,
  PaymentManagerToken,
  RawCreditCardPaymentMethod
} from "../../../../../../types/pagopa";
import {
  getGenericError,
  getNetworkError,
  NetworkError
} from "../../../../../../utils/errors";
import { getPaymentMethodHash } from "../../../../../../utils/paymentMethod";
import { SessionManager } from "../../../../../../utils/SessionManager";
import { convertWalletV2toWalletV1 } from "../../../../../../utils/walletv2";

export const addCobadgeToWallet = async (
  addCobadgeToWallet: ReturnType<
    typeof PaymentManagerClient
  >["addCobadgeToWallet"],
  sessionManager: SessionManager<PaymentManagerToken>,
  paymentInstrument: PaymentInstrument
): Promise<Either<NetworkError, RawCreditCardPaymentMethod>> => {
  try {
    const addCobadgeToWalletWithRefresh = sessionManager.withRefresh(
      addCobadgeToWallet({
        data: { payload: { paymentInstruments: [paymentInstrument] } }
      })
    );
    const addCobadgeToWalletWithRefreshResult = await addCobadgeToWalletWithRefresh();
    if (addCobadgeToWalletWithRefreshResult.isRight()) {
      if (addCobadgeToWalletWithRefreshResult.value.status === 200) {
        const wallets = (
          addCobadgeToWalletWithRefreshResult.value.value.data ?? []
        ).map(convertWalletV2toWalletV1);
        // search for the added cobadge.
        const maybeWallet = fromNullable(
          wallets.find(
            w =>
              w.paymentMethod &&
              getPaymentMethodHash(w.paymentMethod) === paymentInstrument.hpan
          )
        );
        if (
          maybeWallet.isSome() &&
          isRawCreditCard(maybeWallet.value.paymentMethod)
        ) {
          return right(maybeWallet.value.paymentMethod);
        } else {
          return left(
            getGenericError(
              new Error(`cannot find added cobadge in wallets list response`)
            )
          );
        }
      } else {
        return left(
          getGenericError(
            new Error(
              `response status ${addCobadgeToWalletWithRefreshResult.value.status}`
            )
          )
        );
      }
    } else {
      return left(
        getGenericError(
          new Error(readableReport(addCobadgeToWalletWithRefreshResult.value))
        )
      );
    }
  } catch (e) {
    return left(getNetworkError(e));
  }
};
