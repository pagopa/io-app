import { SagaIterator } from "redux-saga";
import * as pot from "italia-ts-commons/lib/pot";
import { takeLatest, select } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { bpdApiUrlPrefix } from "../../../../config";
import { profileSelector } from "../../../../store/reducers/profile";
import { BackendBpdClient } from "../api/backendBpdClient";
import { bpdLoadActivationStatus } from "../store/actions/details";
import { bpdIbanInsertionStart, bpdUpsertIban } from "../store/actions/iban";
import {
  bpdEnrollUserToProgram,
  bpdDeleteUserFromProgram,
  bpdOnboardingAcceptDeclaration,
  bpdOnboardingStart
} from "../store/actions/onboarding";
import { deleteCitizen, getCitizen, putEnrollCitizen } from "./networking";
import { patchCitizenIban } from "./networking/patchCitizenIban";
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
    // FIX ME !this code must be removed!
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

  // First step of the onboarding workflow; check if the user is enrolled to the bpd program
  yield takeLatest(getType(bpdOnboardingStart), handleBpdStartOnboardingSaga);

  // The user accepts the declaration, enroll the user to the bpd program
  yield takeLatest(getType(bpdOnboardingAcceptDeclaration), handleBpdEnroll);

  // The user start the insertion / modification of the IBAN associated with bpd program
  yield takeLatest(getType(bpdIbanInsertionStart), handleBpdIbanInsertion);
}
