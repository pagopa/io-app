import * as pot from "italia-ts-commons/lib/pot";
import { SagaIterator } from "redux-saga";
import { select, takeEvery, takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { bpdApiUrlPrefix } from "../../../../config";
import { profileSelector } from "../../../../store/reducers/profile";
import { BackendBpdClient } from "../api/backendBpdClient";
import { bpdAmountLoad } from "../store/actions/amount";
import { bpdLoadActivationStatus } from "../store/actions/details";
import { bpdIbanInsertionStart, bpdUpsertIban } from "../store/actions/iban";
import {
  bpdDeleteUserFromProgram,
  bpdEnrollUserToProgram,
  bpdOnboardingAcceptDeclaration,
  bpdOnboardingStart
} from "../store/actions/onboarding";
import {
  bpdPaymentMethodActivation,
  bpdUpdatePaymentMethodActivation
} from "../store/actions/paymentMethods";
import { bpdPeriodsLoad } from "../store/actions/periods";
import { bpdTransactionsLoad } from "../store/actions/transactions";
import { deleteCitizen, getCitizen, putEnrollCitizen } from "./networking";
import { bpdLoadAmountSaga } from "./networking/amount";
import { patchCitizenIban } from "./networking/patchCitizenIban";
import {
  bpdLoadPaymentMethodActivationSaga,
  bpdUpdatePaymentMethodActivationSaga
} from "./networking/paymentMethod";
import { bpdLoadPeriodsSaga } from "./networking/periods";
import { bpdLoadTransactionsSaga } from "./networking/transactions";
import { handleBpdIbanInsertion } from "./orchestration/insertIban";
import { handleBpdEnroll } from "./orchestration/onboarding/enrollToBpd";
import { handleBpdStartOnboardingSaga } from "./orchestration/onboarding/startOnboarding";

// watch all events about bpd
export function* watchBonusBpdSaga(bpdBearerToken: string): SagaIterator {
  const profileState: ReturnType<typeof profileSelector> = yield select(
    profileSelector
  );
  const bpdBackendClient = BackendBpdClient(
    bpdApiUrlPrefix,
    bpdBearerToken,
    // TODO: FIX ME! this code must be removed!
    // only for test purpose
    pot.getOrElse(
      pot.map(profileState, p => p.fiscal_code as string),
      ""
    )
  );

  // load citizen details
  yield takeLatest(
    bpdLoadActivationStatus.request,
    getCitizen,
    bpdBackendClient.find
  );

  // enroll citizen to the bpd
  yield takeLatest(
    bpdEnrollUserToProgram.request,
    putEnrollCitizen,
    bpdBackendClient.enrollCitizenIO
  );

  // delete citizen from the bpd
  yield takeLatest(
    bpdDeleteUserFromProgram.request,
    deleteCitizen,
    bpdBackendClient.deleteCitizenIO
  );

  // upsert citizen iban
  yield takeLatest(
    bpdUpsertIban.request,
    patchCitizenIban,
    bpdBackendClient.updatePaymentMethod
  );

  // load bpd activation status for a specific payment method
  yield takeEvery(
    bpdPaymentMethodActivation.request,
    bpdLoadPaymentMethodActivationSaga,
    bpdBackendClient.findPayment
  );

  // update bpd activation status for a specific payment method
  yield takeEvery(
    bpdUpdatePaymentMethodActivation.request,
    bpdUpdatePaymentMethodActivationSaga,
    bpdBackendClient.enrollPayment,
    bpdBackendClient.deletePayment
  );

  // load bpd periods
  yield takeEvery(
    bpdPeriodsLoad.request,
    bpdLoadPeriodsSaga,
    bpdBackendClient.awardPeriods
  );

  // load bpd amount for a period
  yield takeEvery(
    bpdAmountLoad.request,
    bpdLoadAmountSaga,
    bpdBackendClient.totalCashback
  );

  // load bpd transactions for a period
  yield takeEvery(bpdTransactionsLoad.request, bpdLoadTransactionsSaga);

  // First step of the onboarding workflow; check if the user is enrolled to the bpd program
  yield takeLatest(getType(bpdOnboardingStart), handleBpdStartOnboardingSaga);

  // The user accepts the declaration, enroll the user to the bpd program
  yield takeLatest(getType(bpdOnboardingAcceptDeclaration), handleBpdEnroll);

  // The user start the insertion / modification of the IBAN associated with bpd program
  yield takeLatest(getType(bpdIbanInsertionStart), handleBpdIbanInsertion);
}
