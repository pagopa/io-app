import { readableReport } from "italia-ts-commons/lib/reporters";
import { Millisecond } from "italia-ts-commons/lib/units";
import { SagaIterator } from "redux-saga";
import { call, Effect, put, takeLatest } from "redux-saga/effects";
import { apiUrlPrefix } from "../../../../config";
import { SagaCallReturnType } from "../../../../types/utils";
import { startTimer } from "../../../../utils/timer";
import { BackendBonusVacanze } from "../../api/backendBonusVacanze";
import {
  availableBonusesLoad,
  startBonusEligibility
} from "../actions/bonusVacanze";

const checkEligibilityResultPolling = 1000 as Millisecond;
const pollingTimeThreshold = (20 * 1000) as Millisecond;

// handle start bonus eligibility check
function* checkBonusEligibilitySaga(
  eligibilityCheck: ReturnType<typeof BackendBonusVacanze>["eligibilityCheck"]
): Iterator<Effect, boolean, SagaCallReturnType<typeof eligibilityCheck>> {
  try {
    const eligibilityCheckResult: SagaCallReturnType<
      typeof eligibilityCheck
    > = yield call(eligibilityCheck, {});
    if (eligibilityCheckResult.isRight()) {
      // we got the check result
      if (eligibilityCheckResult.value.status === 200) {
        yield put(
          startBonusEligibility.success(eligibilityCheckResult.value.value)
        );
        return true;
      }
      return false;
    } else {
      // we got some error, stop polling
      throw Error(readableReport(eligibilityCheckResult.value));
    }
  } catch (e) {
    yield put(startBonusEligibility.failure(e));
    return false;
  }
}

// handle start bonus eligibility check
// tslint:disable-next-line: cognitive-complexity
function* startBonusEligibilitySaga(
  startEligibilityCheck: ReturnType<
    typeof BackendBonusVacanze
  >["startEligibilityCheck"],
  eligibilityCheck: ReturnType<typeof BackendBonusVacanze>["eligibilityCheck"]
): SagaIterator {
  try {
    const startEligibilityResult: SagaCallReturnType<
      typeof startEligibilityCheck
    > = yield call(startEligibilityCheck, {});
    if (startEligibilityResult.isRight()) {
      // check started
      if (startEligibilityResult.value.status === 202) {
        yield put(
          startBonusEligibility.success(startEligibilityResult.value.value)
        );
        // start polling to know about the check result
        const startPolling = new Date().getTime();
        // TODO: handle cancel request (stop polling)
        while (true) {
          const eligibilityCheckResult: boolean = yield call(
            checkBonusEligibilitySaga,
            eligibilityCheck
          );
          // we got the response, stop polling
          if (eligibilityCheckResult === true) {
            return;
          }
          // sleep
          yield call(startTimer, checkEligibilityResultPolling);
          // check if the time threshold was exceeded, if yes abort
          const now = new Date().getTime();
          if (now - startPolling >= pollingTimeThreshold) {
            return;
          }
        }
      }
      throw Error(`response status ${startEligibilityResult.value.status}`);
    } else {
      throw Error(readableReport(startEligibilityResult.value));
    }
  } catch (e) {
    yield put(startBonusEligibility.failure(e));
  }
}

// handle bonus list loading
function* loadAvailableBonusesSaga(
  getAvailableBonuses: ReturnType<
    typeof BackendBonusVacanze
  >["getAvailableBonuses"]
): SagaIterator {
  try {
    const bonusListReponse: SagaCallReturnType<
      typeof getAvailableBonuses
    > = yield call(getAvailableBonuses, {});
    if (bonusListReponse.isRight()) {
      if (bonusListReponse.value.status === 200) {
        yield put(availableBonusesLoad.success(bonusListReponse.value.value));
        return;
      }
      throw Error(`response status ${bonusListReponse.value.status}`);
    } else {
      throw Error(readableReport(bonusListReponse.value));
    }
  } catch (e) {
    yield put(availableBonusesLoad.failure(e));
  }
}

// Saga that listen to all bonus requests
export function* watchBonusSaga(): SagaIterator {
  const backendBonusVacanze = BackendBonusVacanze(apiUrlPrefix);
  // available bonus list request
  yield takeLatest(
    availableBonusesLoad.request,
    loadAvailableBonusesSaga,
    backendBonusVacanze.getAvailableBonuses
  );

  // start bonus eligibility check and polling for result
  yield takeLatest(
    startBonusEligibility.request,
    startBonusEligibilitySaga,
    backendBonusVacanze.startEligibilityCheck,
    backendBonusVacanze.eligibilityCheck
  );
}
