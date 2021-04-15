import { SagaIterator } from "redux-saga";
import { takeEvery, takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { bpdApiUrlPrefix, bpdTechnicalIban } from "../../../../config";
import { BackendBpdClient } from "../api/backendBpdClient";
import { bpdAllData, bpdLoadActivationStatus } from "../store/actions/details";
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
import { bpdPeriodsAmountLoad } from "../store/actions/periods";
import { bpdTransactionsLoad } from "../store/actions/transactions";
import {
  deleteCitizen,
  getCitizen,
  getCitizenV2,
  putEnrollCitizen,
  putEnrollCitizenV2
} from "./networking";
import { loadBpdData } from "./networking/loadBpdData";
import { loadPeriodsWithInfo } from "./networking/loadPeriodsWithInfo";
import { patchCitizenIban } from "./networking/patchCitizenIban";
import {
  bpdLoadPaymentMethodActivationSaga,
  bpdUpdatePaymentMethodActivationSaga
} from "./networking/paymentMethod";
import { bpdLoadTransactionsSaga } from "./networking/transactions";
import { handleBpdIbanInsertion } from "./orchestration/insertIban";
import { handleBpdEnroll } from "./orchestration/onboarding/enrollToBpd";
import { handleBpdStartOnboardingSaga } from "./orchestration/onboarding/startOnboarding";

// watch all events about bpd
export function* watchBonusBpdSaga(bpdBearerToken: string): SagaIterator {
  const bpdBackendClient = BackendBpdClient(bpdApiUrlPrefix, bpdBearerToken);

  // load citizen details
  yield takeLatest(
    bpdLoadActivationStatus.request,
    bpdTechnicalIban ? getCitizenV2 : getCitizen,
    bpdTechnicalIban ? bpdBackendClient.findV2 : bpdBackendClient.find
  );
  // enroll citizen to the bpd
  yield takeLatest(
    bpdEnrollUserToProgram.request,
    bpdTechnicalIban ? putEnrollCitizenV2 : putEnrollCitizen,
    bpdTechnicalIban
      ? bpdBackendClient.enrollCitizenV2IO
      : bpdBackendClient.enrollCitizenIO
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

  // prefetch all the bpd data
  yield takeEvery(bpdAllData.request, loadBpdData);

  // load bpd transactions for a period
  yield takeEvery(
    bpdTransactionsLoad.request,
    bpdLoadTransactionsSaga,
    bpdBackendClient.winningTransactions
  );

  // Load bpd periods with amount
  yield takeEvery(
    bpdPeriodsAmountLoad.request,
    loadPeriodsWithInfo,
    bpdBackendClient
  );

  // First step of the onboarding workflow; check if the user is enrolled to the bpd program
  yield takeLatest(getType(bpdOnboardingStart), handleBpdStartOnboardingSaga);

  // The user accepts the declaration, enroll the user to the bpd program
  yield takeLatest(getType(bpdOnboardingAcceptDeclaration), handleBpdEnroll);

  // The user start the insertion / modification of the IBAN associated with bpd program
  yield takeLatest(getType(bpdIbanInsertionStart), handleBpdIbanInsertion);
}
