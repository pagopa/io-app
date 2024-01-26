import { SagaIterator } from "redux-saga";
import { takeEvery, takeLatest } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { bpdApiUrlPrefix } from "../../../../config";
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
import {
  bpdTransactionsLoadCountByDay,
  bpdTransactionsLoadMilestone,
  bpdTransactionsLoadPage,
  bpdTransactionsLoadRequiredData
} from "../store/actions/transactions";
import { deleteCitizen, getCitizenV2, putEnrollCitizenV2 } from "./networking";
import { loadBpdData } from "./networking/loadBpdData";
import { loadPeriodsWithInfo } from "./networking/loadPeriodsWithInfo";
import { patchCitizenIban } from "./networking/patchCitizenIban";
import {
  bpdLoadPaymentMethodActivationSaga,
  bpdUpdatePaymentMethodActivationSaga
} from "./networking/paymentMethod";
import { handleLoadMilestone } from "./networking/ranking";
import { handleCountByDay } from "./networking/winning-transactions/countByDay";
import { handleTransactionsLoadRequiredData } from "./networking/winning-transactions/loadTransactionsRequiredData";
import { handleTransactionsPage } from "./networking/winning-transactions/transactionsPage";
import { handleBpdIbanInsertion } from "./orchestration/insertIban";
import { handleBpdEnroll } from "./orchestration/onboarding/enrollToBpd";
import { handleBpdStartOnboardingSaga } from "./orchestration/onboarding/startOnboarding";

// watch all events about bpd
export function* watchBonusBpdSaga(bpdBearerToken: string): SagaIterator {
  const bpdBackendClient = BackendBpdClient(bpdApiUrlPrefix, bpdBearerToken);

  // load citizen details
  yield* takeLatest(
    bpdLoadActivationStatus.request,
    getCitizenV2,
    bpdBackendClient.findV2
  );
  // enroll citizen to the bpd
  yield* takeLatest(
    bpdEnrollUserToProgram.request,
    putEnrollCitizenV2,
    bpdBackendClient.enrollCitizenV2IO
  );

  // delete citizen from the bpd
  yield* takeLatest(
    bpdDeleteUserFromProgram.request,
    deleteCitizen,
    bpdBackendClient.deleteCitizenIO
  );

  // upsert citizen iban
  yield* takeLatest(
    bpdUpsertIban.request,
    patchCitizenIban,
    bpdBackendClient.updatePaymentMethod
  );

  // load bpd activation status for a specific payment method
  yield* takeEvery(
    bpdPaymentMethodActivation.request,
    bpdLoadPaymentMethodActivationSaga,
    bpdBackendClient.findPayment
  );

  // update bpd activation status for a specific payment method
  yield* takeEvery(
    bpdUpdatePaymentMethodActivation.request,
    bpdUpdatePaymentMethodActivationSaga,
    bpdBackendClient.enrollPayment,
    bpdBackendClient.deletePayment
  );

  // prefetch all the bpd data
  yield* takeEvery(bpdAllData.request, loadBpdData);

  // Load bpd periods with amount
  yield* takeEvery(
    bpdPeriodsAmountLoad.request,
    loadPeriodsWithInfo,
    bpdBackendClient
  );

  // Load count by day info for a period
  yield* takeEvery(
    bpdTransactionsLoadCountByDay.request,
    handleCountByDay,
    bpdBackendClient.winningTransactionsV2CountByDay
  );

  // Load the milestone (pivot) information for a period
  yield* takeEvery(
    bpdTransactionsLoadMilestone.request,
    handleLoadMilestone,
    bpdBackendClient.getRankingV2
  );

  // Load a transactions page for a period
  yield* takeEvery(
    bpdTransactionsLoadPage.request,
    handleTransactionsPage,
    bpdBackendClient.winningTransactionsV2
  );

  // Load all the required transactions data, for a period
  yield* takeEvery(
    bpdTransactionsLoadRequiredData.request,
    handleTransactionsLoadRequiredData
  );

  // First step of the onboarding workflow; check if the user is enrolled to the bpd program
  yield* takeLatest(getType(bpdOnboardingStart), handleBpdStartOnboardingSaga);

  // The user accepts the declaration, enroll the user to the bpd program
  yield* takeLatest(getType(bpdOnboardingAcceptDeclaration), handleBpdEnroll);

  // The user start the insertion / modification of the IBAN associated with bpd program
  yield* takeLatest(getType(bpdIbanInsertionStart), handleBpdIbanInsertion);
}
