import { takeLatest } from "typed-redux-saga/macro";
import { PaymentManagerClient } from "../../../../../api/pagopa";
import { SessionManager } from "../../../../../utils/SessionManager";
import { PaymentManagerToken } from "../../../../../types/pagopa";
import {
  searchPaypalPsp,
  walletAddPaypalRefreshPMToken,
  walletAddPaypalStart
} from "../store/actions";
import { handlePaypalSearchPsp, refreshPMToken } from "./networking";
import { addPaypalToWallet } from "./orchestration";

// watch for all actions regarding paypal
export function* watchPaypalOnboardingSaga(
  pmClient: PaymentManagerClient,
  sessionManager: SessionManager<PaymentManagerToken>
) {
  // search for paypal psp
  yield* takeLatest(
    searchPaypalPsp.request,
    handlePaypalSearchPsp,
    pmClient.searchPayPalPsp,
    sessionManager
  );

  // start paypal onboarding
  yield* takeLatest(walletAddPaypalStart, addPaypalToWallet);

  // refresh PM token before checkout
  yield* takeLatest(
    walletAddPaypalRefreshPMToken.request,
    refreshPMToken,
    sessionManager
  );
}
