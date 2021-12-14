import { call, put } from "redux-saga/effects";
import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import { Option } from "fp-ts/lib/Option";
import { PaymentManagerClient } from "../../../../../../api/pagopa";
import { SessionManager } from "../../../../../../utils/SessionManager";
import { PaymentManagerToken } from "../../../../../../types/pagopa";
import { SagaCallReturnType } from "../../../../../../types/utils";
import {
  searchPaypalPsp,
  walletAddPaypalRefreshPMToken
} from "../../store/actions";
import {
  getError,
  getGenericError,
  getNetworkError
} from "../../../../../../utils/errors";
import { PayPalPsp as NetworkPsp } from "../../../../../../../definitions/pagopa/PayPalPsp";
import { IOPayPalPsp } from "../../types";
import { getPayPalPspIconUrl } from "../../../../../../utils/paymentMethod";
import { readablePrivacyReport } from "../../../../../../utils/reporters";

// convert a paypal psp returned by the API into the app domain model
const convertNetworkPsp = (psp: NetworkPsp): IOPayPalPsp => ({
  id: psp.idPsp,
  logoUrl: getPayPalPspIconUrl(psp.codiceAbi),
  name: psp.ragioneSociale,
  fee: psp.maxFee as NonNegativeNumber,
  privacyUrl: psp.privacyUrl
});

/**
 * handle the request of searching for PayPal psp
 * @param sarchPsp
 * @param sessionManager
 */
export function* handlePaypalSearchPsp(
  sarchPsp: PaymentManagerClient["searchPayPalPsp"],
  sessionManager: SessionManager<PaymentManagerToken>
) {
  try {
    const searchPayPalPspRequest: SagaCallReturnType<typeof sarchPsp> =
      yield call(sessionManager.withRefresh(sarchPsp));
    if (searchPayPalPspRequest.isRight()) {
      if (searchPayPalPspRequest.value.status === 200) {
        yield put(
          searchPaypalPsp.success(
            searchPayPalPspRequest.value.value.data.map(convertNetworkPsp)
          )
        );
        return;
      }
      // != 200
      yield put(
        searchPaypalPsp.failure(
          getGenericError(
            new Error(`response status ${searchPayPalPspRequest.value.status}`)
          )
        )
      );
    } else {
      yield put(
        searchPaypalPsp.failure(
          getGenericError(
            new Error(readablePrivacyReport(searchPayPalPspRequest.value))
          )
        )
      );
    }
  } catch (e) {
    yield put(searchPaypalPsp.failure(getNetworkError(e)));
  }
}

// refresh PM token (it is needed in the webview) to ensure it won't expire during the checkout process
export function* refreshPMToken(
  sessionManager: SessionManager<PaymentManagerToken>
) {
  try {
    // If the request for the new token fails a new Error is raised
    const pagoPaToken: Option<PaymentManagerToken> = yield call(
      sessionManager.getNewToken
    );
    if (pagoPaToken.isSome()) {
      yield put(walletAddPaypalRefreshPMToken.success(pagoPaToken.value));
    } else {
      yield put(
        walletAddPaypalRefreshPMToken.failure(
          new Error("cant load pm session token")
        )
      );
    }
  } catch (e) {
    yield put(walletAddPaypalRefreshPMToken.failure(getError(e)));
  }
}
