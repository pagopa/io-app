import { Either, left, right } from "fp-ts/lib/Either";
import { none, Option, some } from "fp-ts/lib/Option";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { Millisecond } from "italia-ts-commons/lib/units";
import { call, Effect, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { EligibilityCheck } from "../../../../../../definitions/bonus_vacanze/EligibilityCheck";
import { ErrorEnum } from "../../../../../../definitions/bonus_vacanze/EligibilityCheckFailure";
import { EligibilityCheckSuccess } from "../../../../../../definitions/bonus_vacanze/EligibilityCheckSuccess";
import { EligibilityCheckSuccessEligible } from "../../../../../../definitions/bonus_vacanze/EligibilityCheckSuccessEligible";
import { SagaCallReturnType } from "../../../../../types/utils";
import { startTimer } from "../../../../../utils/timer";
import { BackendBonusVacanze } from "../../../api/backendBonusVacanze";
import {
  checkBonusEligibility,
  eligibilityRequestId
} from "../../actions/bonusVacanze";
import { EligibilityRequestProgressEnum } from "../../reducers/eligibility";

// wait time between requests
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
): IterableIterator<Effect | Either<Option<Error>, EligibilityCheck>> {
  try {
    const eligibilityCheckResult: SagaCallReturnType<
      typeof getBonusEligibilityCheck
    > = yield call(getBonusEligibilityCheck, {});

    if (eligibilityCheckResult.isRight()) {
      // 200 -> we got the check result, polling must be stopped
      if (eligibilityCheckResult.value.status === 200) {
        const check = eligibilityCheckResult.value.value;
        return right(check);
      }
      // polling should continue
      return left(none);
    } else {
      // we got some error on decoding, stop polling
      return left(some(Error(readableReport(eligibilityCheckResult.value))));
    }
  } catch (e) {
    return left(none);
  }
}

// return a function that executes getCheckBonusEligibilitySaga
const executeGetEligibilityCheck = (
  getBonusEligibilityCheck: ReturnType<
    typeof BackendBonusVacanze
  >["getBonusEligibilityCheck"]
) =>
  function* executeGetCheckBonusEligibilitySaga(): IterableIterator<
    Effect | SagaCallReturnType<typeof getCheckBonusEligibilitySaga>
  > {
    return yield call(getCheckBonusEligibilitySaga, getBonusEligibilityCheck);
  };

// handle start bonus eligibility check
// tslint:disable-next-line: cognitive-complexity
export const bonusEligibilitySaga = (
  startBonusEligibilityCheck: ReturnType<
    typeof BackendBonusVacanze
  >["startBonusEligibilityCheck"],
  getBonusEligibilityCheck: ReturnType<
    typeof BackendBonusVacanze
  >["getBonusEligibilityCheck"]
) =>
  function* getBonusEligibilitySaga(): IterableIterator<
    Effect | ActionType<typeof checkBonusEligibility>
  > {
    try {
      // before activate, make an optimistic check, maybe the isee result is already available
      const optimisticResult = yield call(
        executeGetEligibilityCheck(getBonusEligibilityCheck)
      );
      if (optimisticResult.isRight()) {
        return checkBonusEligibility.success({
          check: optimisticResult.value,
          status: eligibilityResultToEnum(optimisticResult.value)
        });
      }
      const startEligibilityResult: SagaCallReturnType<
        typeof startBonusEligibilityCheck
      > = yield call(startBonusEligibilityCheck, {});
      if (startEligibilityResult.isRight()) {
        // 201 -> created
        // 202 -> request processing
        // 409 -> pending request
        if (
          startEligibilityResult.value.status === 201 ||
          startEligibilityResult.value.status === 202 ||
          startEligibilityResult.value.status === 409
        ) {
          // processing request, dispatch di process id
          if (startEligibilityResult.value.status === 201) {
            yield put(eligibilityRequestId(startEligibilityResult.value.value));
          }
          // start polling to know about the check result
          const startPolling = new Date().getTime();
          // TODO: handle cancel request (stop polling)
          while (true) {
            const eligibilityCheckResult = yield call(
              executeGetEligibilityCheck(getBonusEligibilityCheck)
            );
            // we got a blocking error -> stop polling
            if (
              eligibilityCheckResult.isLeft() &&
              eligibilityCheckResult.value.isSome()
            ) {
              throw eligibilityCheckResult.value.value;
            }
            // we got the eligibility result, stop polling
            if (eligibilityCheckResult.isRight()) {
              return checkBonusEligibility.success({
                check: eligibilityCheckResult.value,
                status: eligibilityResultToEnum(eligibilityCheckResult.value)
              });
            }
            // sleep
            yield call(startTimer, checkEligibilityResultPolling);
            // check if the time threshold was exceeded, if yes abort
            const now = new Date().getTime();
            if (now - startPolling >= pollingTimeThreshold) {
              return checkBonusEligibility.success({
                status: EligibilityRequestProgressEnum.TIMEOUT
              });
            }
          }
        }
        // there's already an active bonus related to this user
        else if (startEligibilityResult.value.status === 403) {
          return checkBonusEligibility.success({
            status: EligibilityRequestProgressEnum.BONUS_ALREADY_ACTIVE
          });
        }

        throw Error(`response status ${startEligibilityResult.value.status}`);
      } else {
        throw Error(readableReport(startEligibilityResult.value));
      }
    } catch (e) {
      return checkBonusEligibility.failure(e);
    }
  };
