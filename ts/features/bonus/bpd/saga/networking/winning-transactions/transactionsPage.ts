import { Either, left, right } from "fp-ts/lib/Either";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { call, delay, Effect, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { mixpanelTrack } from "../../../../../../mixpanel";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { getBackoffTime } from "../../../../../../utils/backoffError";
import { getError } from "../../../../../../utils/errors";
import { BackendBpdClient } from "../../../api/backendBpdClient";
import { AwardPeriodId } from "../../../store/actions/periods";
import {
  BpdTransactionPageSuccessPayload,
  bpdTransactionsLoadPage
} from "../../../store/actions/transactions";

const mixpanelActionRequest = `BPD_TRANSACTIONS_PAGE_REQUEST`;
const mixpanelActionSuccess = `BPD_TRANSACTIONS_PAGE_SUCCESS`;
const mixpanelActionFailure = `BPD_TRANSACTIONS_PAGE_FAILURE`;

/**
 * Load a page of transactions for a period
 * @param getTransactionPage
 * @param awardPeriodId
 * @param cursor
 */
export function* bpdLoadTransactionsPage(
  getTransactionPage: ReturnType<
    typeof BackendBpdClient
  >["winningTransactionsV2"],
  awardPeriodId: AwardPeriodId,
  cursor?: number
): Generator<
  Effect,
  Either<Error, BpdTransactionPageSuccessPayload>,
  SagaCallReturnType<typeof getTransactionPage>
> {
  try {
    void mixpanelTrack(mixpanelActionRequest);
    const getTransactionsPageResults = yield call(getTransactionPage, {
      awardPeriodId,
      nextCursor: cursor
    } as any);
    if (getTransactionsPageResults.isRight()) {
      if (getTransactionsPageResults.value.status === 200) {
        void mixpanelTrack(mixpanelActionSuccess, {
          count: getTransactionsPageResults.value.value?.transactions.length
        });
        return right<Error, BpdTransactionPageSuccessPayload>({
          awardPeriodId,
          results: getTransactionsPageResults.value.value
        });
      } else {
        return left<Error, BpdTransactionPageSuccessPayload>(
          new Error(
            `response status ${getTransactionsPageResults.value.status}`
          )
        );
      }
    } else {
      return left<Error, BpdTransactionPageSuccessPayload>(
        new Error(readableReport(getTransactionsPageResults.value))
      );
    }
  } catch (e) {
    void mixpanelTrack(mixpanelActionFailure, {
      reason: getError(e).message
    });
    return left<Error, BpdTransactionPageSuccessPayload>(getError(e));
  }
}

/**
 * handle the action bpdTransactionsLoadCountByDay.request
 * @param getTransactionsPage
 * @param action
 */
export function* handleTransactionsPage(
  getTransactionsPage: ReturnType<
    typeof BackendBpdClient
  >["winningTransactionsV2"],
  action: ActionType<typeof bpdTransactionsLoadPage.request>
) {
  const loadPeriodsBackOff: SagaCallReturnType<typeof getBackoffTime> = yield call(
    getBackoffTime,
    bpdTransactionsLoadPage.failure
  );
  if (loadPeriodsBackOff > 0) {
    yield delay(loadPeriodsBackOff);
  }

  // get the results
  const result: SagaCallReturnType<typeof bpdLoadTransactionsPage> = yield call(
    bpdLoadTransactionsPage,
    getTransactionsPage,
    action.payload.awardPeriodId,
    action.payload.nextCursor
  );

  // dispatch the related action
  if (result.isRight()) {
    yield put(bpdTransactionsLoadPage.success(result.value));
  } else {
    yield put(
      bpdTransactionsLoadPage.failure({
        awardPeriodId: action.payload.awardPeriodId,
        error: result.value
      })
    );
  }
}
