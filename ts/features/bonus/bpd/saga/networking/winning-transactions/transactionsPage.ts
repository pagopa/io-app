import * as E from "fp-ts/lib/Either";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { mixpanelTrack } from "../../../../../../mixpanel";
import {
  ReduxSagaEffect,
  SagaCallReturnType
} from "../../../../../../types/utils";
import { waitBackoffError } from "../../../../../../utils/backoffError";
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
  ReduxSagaEffect,
  E.Either<Error, BpdTransactionPageSuccessPayload>,
  SagaCallReturnType<typeof getTransactionPage>
> {
  try {
    void mixpanelTrack(mixpanelActionRequest, { awardPeriodId, cursor });
    const getTransactionsPageResults = yield* call(getTransactionPage, {
      awardPeriodId,
      nextCursor: cursor
    } as any);
    if (E.isRight(getTransactionsPageResults)) {
      if (getTransactionsPageResults.right.status === 200) {
        void mixpanelTrack(mixpanelActionSuccess, {
          awardPeriodId,
          cursor,
          count: getTransactionsPageResults.right.value?.transactions.length
        });
        return E.right<Error, BpdTransactionPageSuccessPayload>({
          awardPeriodId,
          results: getTransactionsPageResults.right.value
        });
      } else {
        return E.left<Error, BpdTransactionPageSuccessPayload>(
          new Error(
            `response status ${getTransactionsPageResults.right.status}`
          )
        );
      }
    } else {
      return E.left<Error, BpdTransactionPageSuccessPayload>(
        new Error(readableReport(getTransactionsPageResults.left))
      );
    }
  } catch (e) {
    void mixpanelTrack(mixpanelActionFailure, {
      awardPeriodId,
      cursor,
      reason: getError(e).message
    });
    return E.left<Error, BpdTransactionPageSuccessPayload>(getError(e));
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
  yield* call(waitBackoffError, bpdTransactionsLoadPage.failure);
  // get the results
  const result: SagaCallReturnType<typeof bpdLoadTransactionsPage> =
    yield* call(
      bpdLoadTransactionsPage,
      getTransactionsPage,
      action.payload.awardPeriodId,
      action.payload.nextCursor
    );

  // dispatch the related action
  if (E.isRight(result)) {
    yield* put(bpdTransactionsLoadPage.success(result.right));
  } else {
    yield* put(
      bpdTransactionsLoadPage.failure({
        awardPeriodId: action.payload.awardPeriodId,
        error: result.left
      })
    );
  }
}
