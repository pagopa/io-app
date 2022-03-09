import { Either, left, right } from "fp-ts/lib/Either";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { mixpanelTrack } from "../../../../../../mixpanel";
import {
  ReduxSagaEffect,
  SagaCallReturnType
} from "../../../../../../types/utils";
import { getError } from "../../../../../../utils/errors";
import { BackendBpdClient } from "../../../api/backendBpdClient";
import { AwardPeriodId } from "../../../store/actions/periods";
import {
  bpdTransactionsLoadCountByDay,
  TrxCountByDayResource
} from "../../../store/actions/transactions";

const mixpanelActionRequest = `BPD_COUNT_BY_DAY_REQUEST`;
const mixpanelActionSuccess = `BPD_COUNT_BY_DAY_SUCCESS`;
const mixpanelActionFailure = `BPD_COUNT_BY_DAY_FAILURE`;

/**
 * Load the countByDay for a period
 * @param getCountByDay
 * @param awardPeriodId
 */
export function* bpdLoadCountByDay(
  getCountByDay: ReturnType<
    typeof BackendBpdClient
  >["winningTransactionsV2CountByDay"],
  awardPeriodId: AwardPeriodId
): Generator<
  ReduxSagaEffect,
  Either<Error, TrxCountByDayResource>,
  SagaCallReturnType<typeof getCountByDay>
> {
  try {
    void mixpanelTrack(mixpanelActionRequest, { awardPeriodId });
    const getCountByDayResults = yield* call(getCountByDay, {
      awardPeriodId
    } as any);
    if (getCountByDayResults.isRight()) {
      if (getCountByDayResults.value.status === 200) {
        void mixpanelTrack(mixpanelActionSuccess, {
          awardPeriodId,
          count: getCountByDayResults.value.value?.length
        });
        return right<Error, TrxCountByDayResource>({
          awardPeriodId,
          results: getCountByDayResults.value.value
        });
      } else {
        return left<Error, TrxCountByDayResource>(
          new Error(`response status ${getCountByDayResults.value.status}`)
        );
      }
    } else {
      return left<Error, TrxCountByDayResource>(
        new Error(readableReport(getCountByDayResults.value))
      );
    }
  } catch (e) {
    void mixpanelTrack(mixpanelActionFailure, {
      awardPeriodId,
      reason: getError(e).message
    });
    return left<Error, TrxCountByDayResource>(getError(e));
  }
}

/**
 * handle the action bpdTransactionsLoadCountByDay.request
 * @param getCountByDay
 * @param action
 */
export function* handleCountByDay(
  getCountByDay: ReturnType<
    typeof BackendBpdClient
  >["winningTransactionsV2CountByDay"],
  action: ActionType<typeof bpdTransactionsLoadCountByDay.request>
) {
  // get the results
  const result: SagaCallReturnType<typeof bpdLoadCountByDay> = yield* call(
    bpdLoadCountByDay,
    getCountByDay,
    action.payload
  );

  // dispatch the related action
  if (result.isRight()) {
    yield* put(bpdTransactionsLoadCountByDay.success(result.value));
  } else {
    yield* put(
      bpdTransactionsLoadCountByDay.failure({
        awardPeriodId: action.payload,
        error: result.value
      })
    );
  }
}
