import { readableReport } from "italia-ts-commons/lib/reporters";
import { Millisecond } from "italia-ts-commons/lib/units";
import { SagaIterator } from "redux-saga";
import { all, call, Effect, put } from "redux-saga/effects";
import { EligibilityCheck } from "../../../../../../definitions/bonus_vacanze/EligibilityCheck";
import { ErrorEnum } from "../../../../../../definitions/bonus_vacanze/EligibilityCheckFailure";
import { EligibilityCheckSuccess } from "../../../../../../definitions/bonus_vacanze/EligibilityCheckSuccess";
import { EligibilityCheckSuccessEligible } from "../../../../../../definitions/bonus_vacanze/EligibilityCheckSuccessEligible";
import { SagaCallReturnType } from "../../../../../types/utils";
import { startTimer } from "../../../../../utils/timer";
import { BackendBonusVacanze } from "../../../api/backendBonusVacanze";
import {
  checkBonusEligibility,
  eligibilityRequestId,
  eligibilityRequestProgress
} from "../../actions/bonusVacanze";
import { EligibilityRequestProgressEnum } from "../../reducers/eligibility";

const checkEligibilityResultPolling = 1000 as Millisecond;
// stop polling when elapsed time from the beginning exceeds this threshold
const pollingTimeThreshold = (10 * 1000) as Millisecond;

const eligibilityResultToEnum = (check: EligibilityCheck) => {
  // success
  if (EligibilityCheckSuccess.is(check)) {
    if (EligibilityCheckSuccessEligible.is(check)) {
      return EligibilityRequestProgressEnum.ELIGIBLE;
    }
    // if it is ont elibigle it is ineligible
    return EligibilityRequestProgressEnum.INELIGIBLE;
  } else {
    // failure
    switch (check.error) {
      case ErrorEnum.DATA_NOT_FOUND:
        return EligibilityRequestProgressEnum.ISEE_NOT_FOUND;
      case ErrorEnum.INTERNAL_ERROR:
      case ErrorEnum.INVALID_REQUEST:
      case ErrorEnum.DATABASE_OFFLINE:
        return EligibilityRequestProgressEnum.ERROR;
      default:
        return EligibilityRequestProgressEnum.UNDEFINED;
    }
  }
};

// handle start bonus eligibility check
function* checkBonusEligibilitySaga(
  getBonusEligibilityCheck: ReturnType<
    typeof BackendBonusVacanze
  >["getBonusEligibilityCheck"]
): IterableIterator<Effect | boolean> {
  try {
    const eligibilityCheckResult: SagaCallReturnType<
      typeof getBonusEligibilityCheck
    > = yield call(getBonusEligibilityCheck, {});

    if (eligibilityCheckResult.isRight()) {
      // we got the check result
      if (eligibilityCheckResult.value.status === 200) {
        yield all([
          put(
            checkBonusEligibility.success(eligibilityCheckResult.value.value)
          ),
          put(
            eligibilityRequestProgress(
              eligibilityResultToEnum(eligibilityCheckResult.value.value)
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

/**
 * This saga handle the networking part for the bonus eligibility
 * @param startBonusEligibilityCheck
 * @param getBonusEligibilityCheck
 */
// tslint:disable-next-line: cognitive-complexity
export function* getBonusEligibilitySaga(
  startBonusEligibilityCheck: ReturnType<
    typeof BackendBonusVacanze
  >["startBonusEligibilityCheck"],
  getBonusEligibilityCheck: ReturnType<
    typeof BackendBonusVacanze
  >["getBonusEligibilityCheck"]
): SagaIterator {
  try {
    // request is pending
    yield put(
      eligibilityRequestProgress(EligibilityRequestProgressEnum.PROGRESS)
    );
    const startEligibilityResult: SagaCallReturnType<
      typeof startBonusEligibilityCheck
    > = yield call(startBonusEligibilityCheck, {});
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
          const eligibilityCheckResult: SagaCallReturnType<
            typeof checkBonusEligibilitySaga
          > = yield call(checkBonusEligibilitySaga, getBonusEligibilityCheck);
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
