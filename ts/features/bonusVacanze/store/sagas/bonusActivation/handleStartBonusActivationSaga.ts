import { Either, left, right } from "fp-ts/lib/Either";
import { none, Option, some } from "fp-ts/lib/Option";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { Millisecond } from "italia-ts-commons/lib/units";
import { SagaIterator } from "redux-saga";
import { call, Effect, put } from "redux-saga/effects";
import { BonusActivationWithQrCode } from "../../../../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import { SagaCallReturnType } from "../../../../../types/utils";
import { startTimer } from "../../../../../utils/timer";
import { BackendBonusVacanze } from "../../../api/backendBonusVacanze";
import { bonusVacanzeActivation } from "../../actions/bonusVacanze";
import { BonusActivationProgressEnum } from "../../reducers/bonusVacanzeActivation";

// wait time between requests
const bonusActivationResultPolling = 1000 as Millisecond;
// stop polling when elapsed time from the beginning exceeds this threshold
const pollingTimeThreshold = (10 * 1000) as Millisecond;

const bonusActivationStatusMapping: Record<
  403 | 409,
  BonusActivationProgressEnum
> = {
  409: BonusActivationProgressEnum.EXISTS,
  403: BonusActivationProgressEnum.ELIGIBILITY_EXPIRED
};

/**
 * return right if the request has been processed
 * return left(true) if we got a blocking error (404 / decoding failure)
 * @param getBonusEligibilityCheck
 */
function* getBonusActivation(
  getLatestBonusVacanzeFromId: ReturnType<
    typeof BackendBonusVacanze
  >["getLatestBonusVacanzeFromId"],
  bonusId: string
): IterableIterator<Effect | Either<Option<Error>, BonusActivationWithQrCode>> {
  try {
    const getLatestBonusVacanzeFromIdResult: SagaCallReturnType<
      typeof getLatestBonusVacanzeFromId
    > = yield call(getLatestBonusVacanzeFromId, { bonus_id: bonusId });

    if (getLatestBonusVacanzeFromIdResult.isRight()) {
      // 200 -> we got the check result, polling must be stopped
      if (getLatestBonusVacanzeFromIdResult.value.status === 200) {
        return right(getLatestBonusVacanzeFromIdResult.value.value);
      }
      // Request not found - polling must be stopped
      if (getLatestBonusVacanzeFromIdResult.value.status === 404) {
        return left(some(new Error("Bonus Activation not found")));
      }
      // polling should be continue
      return left(none);
    } else {
      // we got some error on decoding, stop polling
      return left(
        some(Error(readableReport(getLatestBonusVacanzeFromIdResult.value)))
      );
    }
  } catch (e) {
    // polling should be continue
    return left(none);
  }
}

// tslint:disable-next-line: cognitive-complexity
export function* startBonusActivationSaga(
  startBonusActivationProcedure: ReturnType<
    typeof BackendBonusVacanze
  >["startBonusActivationProcedure"],
  getLatestBonusVacanzeFromId: ReturnType<
    typeof BackendBonusVacanze
  >["getLatestBonusVacanzeFromId"]
): SagaIterator {
  try {
    const startBonusActivationProcedureResult: SagaCallReturnType<
      typeof startBonusActivationProcedure
    > = yield call(startBonusActivationProcedure, {});
    if (startBonusActivationProcedureResult.isRight()) {
      const status = startBonusActivationProcedureResult.value.status;
      // 202 -> Request accepted.
      if (startBonusActivationProcedureResult.value.status === 202) {
        const instanceId = startBonusActivationProcedureResult.value.value;
        // start polling to know about the check result
        const startPollingTime = new Date().getTime();
        while (true) {
          const bonusActivationFromIdResult: SagaCallReturnType<
            typeof getBonusActivation
          > = yield call(
            getBonusActivation,
            getLatestBonusVacanzeFromId,
            instanceId.id
          );
          // blocking error -> stop polling
          if (
            bonusActivationFromIdResult.isLeft() &&
            bonusActivationFromIdResult.value.isSome()
          ) {
            throw bonusActivationFromIdResult.value;
          }
          // we got the result -> stop polling
          else if (bonusActivationFromIdResult.isRight()) {
            yield put(
              bonusVacanzeActivation.success({
                status: BonusActivationProgressEnum.SUCCESS,
                activation: bonusActivationFromIdResult.value
              })
            );
            return;
          }
          // sleep
          yield call(startTimer, bonusActivationResultPolling);
          // check if the time threshold was exceeded, if yes abort
          const now = new Date().getTime();
          if (now - startPollingTime >= pollingTimeThreshold) {
            yield put(
              bonusVacanzeActivation.success({
                status: BonusActivationProgressEnum.TIMEOUT
              })
            );
            return;
          }
        }
      }
      // 409 -> Cannot activate a new bonus because another bonus related to this user was found.
      // 403 -> Eligibility Expired
      else if (status === 409 || status === 403) {
        yield put(
          bonusVacanzeActivation.success({
            status: bonusActivationStatusMapping[status]
          })
        );
        return;
      }
      throw Error(
        `response status ${startBonusActivationProcedureResult.value.status}`
      );
    }
  } catch (e) {
    yield put(bonusVacanzeActivation.failure(e));
  }
}
