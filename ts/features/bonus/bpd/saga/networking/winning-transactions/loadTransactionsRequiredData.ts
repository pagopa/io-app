import { Either, left, right } from "fp-ts/lib/Either";
import { call, Effect, put, take } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { waitBackoffError } from "../../../../../../utils/backoffError";
import { AwardPeriodId } from "../../../store/actions/periods";
import {
  BpdTransactionsError,
  bpdTransactionsLoadCountByDay,
  bpdTransactionsLoadMilestone,
  bpdTransactionsLoadPage,
  bpdTransactionsLoadRequiredData
} from "../../../store/actions/transactions";

/**
 * Load all the information required to render the transactions list :
 * - Milestone Pivot
 * - CountByDay
 * - First transaction page
 * These are the required information in order to do the first render for the transaction page
 */
export function* loadTransactionsRequiredData(
  periodId: AwardPeriodId
): Generator<Effect, Either<BpdTransactionsError, true>, any> {
  // We check if there is a failure on the whole loadTransactionsRequiredData block
  yield call(waitBackoffError, bpdTransactionsLoadRequiredData.failure);

  // First request the Milestone Pivot
  yield put(bpdTransactionsLoadMilestone.request(periodId));

  const milestoneResponse: ActionType<
    | typeof bpdTransactionsLoadMilestone.success
    | typeof bpdTransactionsLoadMilestone.failure
  > = yield take([
    getType(bpdTransactionsLoadMilestone.success),
    getType(bpdTransactionsLoadMilestone.failure)
  ]);

  if (
    milestoneResponse.type === getType(bpdTransactionsLoadMilestone.failure)
  ) {
    return left({
      awardPeriodId: periodId,
      error: new Error("Failed to load bpd transactions milestone")
    });
  }

  // Request CountByDay
  yield put(bpdTransactionsLoadCountByDay.request(periodId));

  const countByDayResponse: ActionType<
    | typeof bpdTransactionsLoadCountByDay.success
    | typeof bpdTransactionsLoadCountByDay.failure
  > = yield take([
    getType(bpdTransactionsLoadCountByDay.success),
    getType(bpdTransactionsLoadCountByDay.failure)
  ]);
  if (
    countByDayResponse.type === getType(bpdTransactionsLoadCountByDay.failure)
  ) {
    return left({
      awardPeriodId: periodId,
      error: new Error("Failed to load bpd transactions countByDay")
    });
  }

  // Request first transaction page for the period
  yield put(bpdTransactionsLoadPage.request({ awardPeriodId: periodId }));

  const firstPageResponse: ActionType<
    | typeof bpdTransactionsLoadPage.success
    | typeof bpdTransactionsLoadPage.failure
  > = yield take([
    getType(bpdTransactionsLoadPage.success),
    getType(bpdTransactionsLoadPage.failure)
  ]);
  if (firstPageResponse.type === getType(bpdTransactionsLoadPage.failure)) {
    return left({
      awardPeriodId: periodId,
      error: new Error("Failed to load the first transactions page")
    });
  }
  return right(true);
}

/**
 * Handle the trigger action bpdTransactionsLoadRequiredData.request
 * @param action
 */
export function* handleTransactionsLoadRequiredData(
  action: ActionType<typeof bpdTransactionsLoadRequiredData.request>
) {
  // get the results
  const result: SagaCallReturnType<typeof loadTransactionsRequiredData> =
    yield call(loadTransactionsRequiredData, action.payload);

  if (result.isRight()) {
    yield put(bpdTransactionsLoadRequiredData.success(action.payload));
  } else {
    yield put(bpdTransactionsLoadRequiredData.failure(result.value));
  }
}
