import { takeLatest } from "redux-saga/effects";
import { PaymentManagerClient } from "../../../../../api/pagopa";
import { SessionManager } from "../../../../../utils/SessionManager";
import { PaymentManagerToken } from "../../../../../types/pagopa";
import { searchPaypalPsp, walletAddPaypalStart } from "../store/actions";
import { handlePaypalSearchPsp } from "./networking";
import { addPaypalToWallet } from "./orchestration";

// watch for all actions regarding paypal
export function* watchPaypalOnboardingSaga(
  pmClient: PaymentManagerClient,
  sessionManager: SessionManager<PaymentManagerToken>
) {
  // search for paypal psp
  yield takeLatest(
    searchPaypalPsp.request,
    handlePaypalSearchPsp,
    pmClient.searchPayPalPsp,
    sessionManager
  );

  // start paypal onboarding
  yield takeLatest(walletAddPaypalStart, addPaypalToWallet);
}
