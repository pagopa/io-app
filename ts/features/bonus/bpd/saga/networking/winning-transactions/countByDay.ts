import * as E from "fp-ts/lib/Either";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
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
  E.Either<Error, TrxCountByDayResource>,
  SagaCallReturnType<typeof getCountByDay>
> {
  try {
    void mixpanelTrack(mixpanelActionRequest, { awardPeriodId });
    const getCountByDayResults = yield* call(getCountByDay, {
      awardPeriodId
    } as any);
    if (E.isRight(getCountByDayResults)) {
      if (getCountByDayResults.right.status === 200) {
        void mixpanelTrack(mixpanelActionSuccess, {
          awardPeriodId,
          count: getCountByDayResults.right.value?.length
        });
        return E.right<Error, TrxCountByDayResource>({
          awardPeriodId,
          results: getCountByDayResults.right.value
        });
      } else {
        return E.left<Error, TrxCountByDayResource>(
          new Error(`response status ${getCountByDayResults.right.status}`)
        );
      }
    } else {
      return E.left<Error, TrxCountByDayResource>(
        new Error(readableReport(getCountByDayResults.left))
      );
    }
  } catch (e) {
    void mixpanelTrack(mixpanelActionFailure, {
      awardPeriodId,
      reason: getError(e).message
    });
    return E.left<Error, TrxCountByDayResource>(getError(e));
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
  if (E.isRight(result)) {
    yield* put(bpdTransactionsLoadCountByDay.success(result.right));
  } else {
    yield* put(
      bpdTransactionsLoadCountByDay.failure({
        awardPeriodId: action.payload,
        error: result.left
      })
    );
  }
}
