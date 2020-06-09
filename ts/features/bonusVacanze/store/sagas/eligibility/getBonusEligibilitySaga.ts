import { Either, left, right } from "fp-ts/lib/Either";
import { some } from "fp-ts/lib/Option";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { Millisecond } from "italia-ts-commons/lib/units";
import { SagaIterator } from "redux-saga";
import { call, Effect, put } from "redux-saga/effects";
import { EligibilityCheck } from "../../../../../../definitions/bonus_vacanze/EligibilityCheck";
import { ErrorEnum } from "../../../../../../definitions/bonus_vacanze/EligibilityCheckFailure";
import { EligibilityCheckSuccess } from "../../../../../../definitions/bonus_vacanze/EligibilityCheckSuccess";
import { EligibilityCheckSuccessEligible } from "../../../../../../definitions/bonus_vacanze/EligibilityCheckSuccessEligible";
import { apiUrlPrefix } from "../../../../../config";
import { SagaCallReturnType } from "../../../../../types/utils";
import { startTimer } from "../../../../../utils/timer";
import { BackendBonusVacanze } from "../../../api/backendBonusVacanze";
import {
  checkBonusEligibility,
  eligibilityRequestId
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
    // if it is not eligible -> it is ineligible
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
        // should never happen
        return EligibilityRequestProgressEnum.UNDEFINED;
    }
  }
};

/**
 * return right if the request has been processed
 * return left(true) if we got a blocking error (404 / decoding failure)
 * @param getBonusEligibilityCheck
 */
function* getCheckBonusEligibilitySaga(
  getBonusEligibilityCheck: ReturnType<
    typeof BackendBonusVacanze
  >["getBonusEligibilityCheck"]
): IterableIterator<Effect | Either<boolean, EligibilityCheck>> {
  try {
    const eligibilityCheckResult: SagaCallReturnType<
      typeof getBonusEligibilityCheck
    > = yield call(getBonusEligibilityCheck, {});

    if (eligibilityCheckResult.isRight()) {
      // 200 -> we got the check result, polling must be stopped
      if (eligibilityCheckResult.value.status === 200) {
        const eligibilityCheck = eligibilityCheckResult.value.value;
        yield put(
          checkBonusEligibility.success({
            check: eligibilityCheck,
            status: eligibilityResultToEnum(eligibilityCheck)
          })
        );
        return right(eligibilityCheck);
      }
      // Request not found - polling must be stopped
      if (eligibilityCheckResult.value.status === 404) {
        return left(true);
      }
      // polling should be continue
      return left(false);
    } else {
      yield put(
        checkBonusEligibility.failure(
          Error(readableReport(eligibilityCheckResult.value))
        )
      );
      // we got some error on decoding, stop polling
      return left(some(true));
    }
  } catch (e) {
    yield put(checkBonusEligibility.failure(e));
    // polling should be continue
    return left(false);
  }
}

// handle start bonus eligibility check
// tslint:disable-next-line: cognitive-complexity
export function* getBonusEligibilitySaga(): SagaIterator {
  try {
    const backendBonusVacanze = BackendBonusVacanze(apiUrlPrefix);

    const startBonusEligibilityCheck =
      backendBonusVacanze.startBonusEligibilityCheck;
    const getBonusEligibilityCheck =
      backendBonusVacanze.getBonusEligibilityCheck;

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
            typeof getCheckBonusEligibilitySaga
          > = yield call(
            getCheckBonusEligibilitySaga,
            getBonusEligibilityCheck
          );

          // we got a blocking error -> stop polling
          if (eligibilityCheckResult.isLeft() && eligibilityCheckResult.value) {
            throw Error("Polling blocking error");
          }
          // we got the eligibility result, stop polling
          if (eligibilityCheckResult.isRight()) {
            return;
          }
          // sleep
          yield call(startTimer, checkEligibilityResultPolling);
          // check if the time threshold was exceeded, if yes abort
          const now = new Date().getTime();
          if (now - startPolling >= pollingTimeThreshold) {
            yield put(
              checkBonusEligibility.success({
                status: EligibilityRequestProgressEnum.TIMEOUT
              })
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
