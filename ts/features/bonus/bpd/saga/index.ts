import { SagaIterator } from "redux-saga";
import { takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import {
  apiUrlPrefix,
  fetchPaymentManagerLongTimeout
} from "../../../../config";
import { BackendBpdClient } from "../api/backendBpdClient";
import {
  bpdLoadActivationStatus,
  bpdUpsertIban
} from "../store/actions/details";
import {
  bpdEnrollUserToProgram,
  bpdOnboardingAcceptDeclaration,
  bpdOnboardingStart
} from "../store/actions/onboarding";
import { getCitizen, putEnrollCitizen } from "./networking";
import { handleBpdEnroll } from "./orchestration/onboarding/enrollToBpd";
import { handleBpdStartOnboardingSaga } from "./orchestration/onboarding/startOnboarding";
import { patchCitizenIban } from "./networking/patchCitizenIban";
import { PaymentManagerClient } from "../../../../api/pagopa";
import { defaultRetryingFetch } from "../../../../utils/fetch";
import { loadBancomatAbi } from "../../../wallet/onboarding/bancomat/saga/networking";

// watch all events about bpd
export function* watchBonusBpdSaga(
  bpdBearerToken: string,
  paymentManagerUrlPrefix: string,
  walletToken: string
): SagaIterator {
  const bpdBackendClient = BackendBpdClient(apiUrlPrefix, bpdBearerToken);
  const paymentManagerClient: PaymentManagerClient = PaymentManagerClient(
    paymentManagerUrlPrefix,
    walletToken,
    defaultRetryingFetch(),
    defaultRetryingFetch(fetchPaymentManagerLongTimeout, 0)
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

  // upsert citizen iban
  yield takeLatest(
    bpdUpsertIban.request,
    patchCitizenIban,
    bpdBackendClient.updatePaymentMethod
  );

  // First step of the onboarding workflow; check if the user is enrolled to the bpd program
  yield takeLatest(getType(bpdOnboardingStart), handleBpdStartOnboardingSaga);

  // The user accepts the declaration, enroll the user to the bpd program
  yield takeLatest(getType(bpdOnboardingAcceptDeclaration), handleBpdEnroll);
}
