import { Either, left, right } from "fp-ts/lib/Either";
import { none, Option, some } from "fp-ts/lib/Option";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { Millisecond } from "italia-ts-commons/lib/units";
import { call, Effect } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { BonusActivationStatusEnum } from "../../../../../../definitions/bonus_vacanze/BonusActivationStatus";
import { BonusActivationWithQrCode } from "../../../../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import { SagaCallReturnType } from "../../../../../types/utils";
import { startTimer } from "../../../../../utils/timer";
import { BackendBonusVacanze } from "../../../api/backendBonusVacanze";
import { activateBonusVacanze } from "../../actions/bonusVacanze";
import { BonusActivationProgressEnum } from "../../reducers/activation";

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
 * @param getLatestBonusVacanzeFromId
 * @param bonusId
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
        const activation = getLatestBonusVacanzeFromIdResult.value.value;
        switch (activation.status) {
          // we got some error, stop polling
          case BonusActivationStatusEnum.PROCESSING:
            return left(none);
          case BonusActivationStatusEnum.FAILED:
            // blocking error
            return left(some(new Error("Bonus Activation failed")));
          default:
            // active
            return right(getLatestBonusVacanzeFromIdResult.value.value);
        }
      }
      // Request not found - polling must be stopped
      if (getLatestBonusVacanzeFromIdResult.value.status === 404) {
        return left(some(new Error("Bonus Activation not found")));
      }
      // polling should continue
      return left(none);
    } else {
      // we got some error on decoding, stop polling
      return left(
        some(Error(readableReport(getLatestBonusVacanzeFromIdResult.value)))
      );
    }
  } catch (e) {
    // polling should continue
    return left(none);
  }
}

// tslint:disable-next-line: cognitive-complexity
export const bonusActivationSaga = (
  startBonusActivationProcedure: ReturnType<
    typeof BackendBonusVacanze
  >["startBonusActivationProcedure"],
  getLatestBonusVacanzeFromId: ReturnType<
    typeof BackendBonusVacanze
  >["getLatestBonusVacanzeFromId"]
) =>
  function* startBonusActivationSaga(): IterableIterator<
    Effect | ActionType<typeof activateBonusVacanze>
  > {
    try {
      const startBonusActivationProcedureResult: SagaCallReturnType<
        typeof startBonusActivationProcedure
      > = yield call(startBonusActivationProcedure, {});
      if (startBonusActivationProcedureResult.isRight()) {
        const status = startBonusActivationProcedureResult.value.status;
        // 201 -> Request created.
        if (startBonusActivationProcedureResult.value.status === 201) {
          const instanceId = startBonusActivationProcedureResult.value.value;
          // start polling to try to get bonus activation
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
              return activateBonusVacanze.success({
                status: BonusActivationProgressEnum.SUCCESS,
                activation: bonusActivationFromIdResult.value
              });
            }
            // sleep
            yield call(startTimer, bonusActivationResultPolling);
            // check if the time threshold was exceeded, if yes stop polling
            const now = new Date().getTime();
            if (now - startPollingTime >= pollingTimeThreshold) {
              return activateBonusVacanze.success({
                status: BonusActivationProgressEnum.TIMEOUT
              });
            }
          }
        }
        // 202 -> still processing
        if (startBonusActivationProcedureResult.value.status === 202) {
          return activateBonusVacanze.success({
            status: BonusActivationProgressEnum.TIMEOUT
          });
        }
        // 409 -> Cannot activate a new bonus because another bonus related to this user was found.
        // 403 -> Eligibility Expired
        else if (status === 409 || status === 403) {
          return activateBonusVacanze.success({
            status: bonusActivationStatusMapping[status]
          });
        }
        throw Error(
          `response status ${startBonusActivationProcedureResult.value.status}`
        );
      }
      // decoding failure
      throw Error(readableReport(startBonusActivationProcedureResult.value));
    } catch (e) {
      return activateBonusVacanze.failure(e);
    }
  };
