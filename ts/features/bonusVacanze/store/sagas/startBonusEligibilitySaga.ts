import { readableReport } from "italia-ts-commons/lib/reporters";
import { Millisecond } from "italia-ts-commons/lib/units";
import { SagaIterator } from "redux-saga";
import { all, call, put } from "redux-saga/effects";
import { SagaCallReturnType } from "../../../../types/utils";
import { startTimer } from "../../../../utils/timer";
import { BackendBonusVacanze } from "../../api/backendBonusVacanze";
import { EligibilityCheckStatusEnum } from "../../types/eligibility";
import {
  checkBonusEligibility,
  eligibilityRequestId,
  eligibilityRequestProgress
} from "../actions/bonusVacanze";
import { EligibilityRequestProgressEnum } from "../reducers/eligibility";

const checkEligibilityResultPolling = 1000 as Millisecond;
// stop polling when elapsed time from the beginning exceeds this threshold
const pollingTimeThreshold = (10 * 1000) as Millisecond;

const eligibilityResultToEnum = (
  responseStatus: EligibilityCheckStatusEnum
) => {
  switch (responseStatus) {
    case EligibilityCheckStatusEnum.ISEE_NOT_FOUND:
      return EligibilityRequestProgressEnum.ISEE_NOT_FOUND;
    case EligibilityCheckStatusEnum.INELIGIBLE:
      return EligibilityRequestProgressEnum.INELIGIBLE;
    case EligibilityCheckStatusEnum.ELIGIBLE:
      return EligibilityRequestProgressEnum.ELIGIBLE;
    default:
      return EligibilityRequestProgressEnum.UNDEFINED;
  }
};

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
        yield all([
          put(
            checkBonusEligibility.success(eligibilityCheckResult.value.value)
          ),
          put(
            eligibilityRequestProgress(
              eligibilityResultToEnum(eligibilityCheckResult.value.value.status)
            )
          )
        ]);

        return true;
      }
      return false;
    } else {
      // we got some error, stop polling
      throw Error(readableReport(eligibilityCheckResult.value));
    }
  } catch (e) {
    yield all([
      // TODO: atm the error of this call are hidden by the pooling phase.
      //  What to do when an error occurs here?
      // put(eligibilityRequestProgress(EligibilityRequestProgressEnum.ERROR)),
      put(checkBonusEligibility.failure(e))
    ]);
    return false;
  }
}

// handle start bonus eligibility check
// tslint:disable-next-line: cognitive-complexity
export function* startBonusEligibilitySaga(
  postEligibilityCheck: ReturnType<
    typeof BackendBonusVacanze
  >["postEligibilityCheck"],
  getEligibilityCheck: ReturnType<
    typeof BackendBonusVacanze
  >["getEligibilityCheck"]
): SagaIterator {
  try {
    // request is pending
    yield put(
      eligibilityRequestProgress(EligibilityRequestProgressEnum.PROGRESS)
    );
    const startEligibilityResult: SagaCallReturnType<
      typeof postEligibilityCheck
    > = yield call(postEligibilityCheck, {});
    if (startEligibilityResult.isRight()) {
      // 202 -> request accepted | 409 -> pending request
      if (
        startEligibilityResult.value.status === 202 ||
        startEligibilityResult.value.status === 409
      ) {
        // processing request, dispatch di process id
        if (startEligibilityResult.value.status === 202) {
          yield put(eligibilityRequestId(startEligibilityResult.value.value));
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
              eligibilityRequestProgress(EligibilityRequestProgressEnum.TIMEOUT)
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
    yield all([
      put(eligibilityRequestProgress(EligibilityRequestProgressEnum.ERROR)),
      put(checkBonusEligibility.failure(e))
    ]);
  }
}
