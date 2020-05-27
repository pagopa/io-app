import { readableReport } from "italia-ts-commons/lib/reporters";
import { Millisecond } from "italia-ts-commons/lib/units";
import { SagaIterator } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";
import { apiUrlPrefix } from "../../../../config";
import { SagaCallReturnType } from "../../../../types/utils";
import { startTimer } from "../../../../utils/timer";
import { BackendBonusVacanze } from "../../api/backendBonusVacanze";
import {
  availableBonusesLoad,
  checkBonusEligibility
} from "../actions/bonusVacanze";

const checkEligibilityResultPolling = 1000 as Millisecond;
// stop polling when elapsed time from the beginning exceeds this threshold
const pollingTimeThreshold = (3 * 1000) as Millisecond;

// handle start bonus eligibility check
function* checkBonusEligibilitySaga(
  getEligibilityCheck: ReturnType<
    typeof BackendBonusVacanze
  >["getEligibilityCheck"]
): SagaIterator {
  try {
    const eligibilityCheckResult: SagaCallReturnType<
      typeof getEligibilityCheck
    > = yield call(getEligibilityCheck, {});
    if (eligibilityCheckResult.isRight()) {
      // we got the check result
      if (eligibilityCheckResult.value.status === 200) {
        yield put(
          checkBonusEligibility.success(eligibilityCheckResult.value.value)
        );
        return true;
      }
      return false;
    } else {
      // we got some error, stop polling
      throw Error(readableReport(eligibilityCheckResult.value));
    }
  } catch (e) {
    yield put(checkBonusEligibility.failure(e));
    return false;
  }
}

// handle start bonus eligibility check
// tslint:disable-next-line: cognitive-complexity
function* startBonusEligibilitySaga(
  postEligibilityCheck: ReturnType<
    typeof BackendBonusVacanze
  >["postEligibilityCheck"],
  getEligibilityCheck: ReturnType<
    typeof BackendBonusVacanze
  >["getEligibilityCheck"]
): SagaIterator {
  try {
    const startEligibilityResult: SagaCallReturnType<
      typeof postEligibilityCheck
    > = yield call(postEligibilityCheck, {});
    if (startEligibilityResult.isRight()) {
      // request accepted | pending request
      if (
        startEligibilityResult.value.status === 202 ||
        startEligibilityResult.value.status === 409
      ) {
        if (startEligibilityResult.value.status === 202) {
          yield put(
            checkBonusEligibility.success(startEligibilityResult.value.value)
          );
        }
        // start polling to know about the check result
        const startPolling = new Date().getTime();
        // TODO: handle cancel request (stop polling)
        while (true) {
          const eligibilityCheckResult: boolean = yield call(
            checkBonusEligibilitySaga,
            getEligibilityCheck
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
            yield put(
              checkBonusEligibility.failure(new Error("polling time exceeded"))
            );

            return;
          }
        }
      }
      throw Error(`response status ${startEligibilityResult.value.status}`);
    } else {
      throw Error(readableReport(startEligibilityResult.value));
    }
  } catch (e) {
    yield put(checkBonusEligibility.failure(e));
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
    checkBonusEligibility.request,
    startBonusEligibilitySaga,
    backendBonusVacanze.postEligibilityCheck,
    backendBonusVacanze.getEligibilityCheck
  );
}
