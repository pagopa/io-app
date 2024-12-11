import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";
import { put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { getPaymentsNoticeAction } from "../store/actions";
import { TransactionClient } from "../../common/api/client";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { NoticeHeaders } from "../utils/types";
import { withPaymentsSessionToken } from "../../common/utils/withPaymentsSessionToken";

const DEFAULT_TRANSACTION_LIST_SIZE = 10;

export function* handleGetNotice(
  getTransactionList: TransactionClient["getPaidNotices"],
  action: ActionType<(typeof getPaymentsNoticeAction)["request"]>
) {
  try {
    const getTransactionListResult = yield* withPaymentsSessionToken(
      getTransactionList,
      action,
      {
        size: action.payload.size || DEFAULT_TRANSACTION_LIST_SIZE,
        "x-continuation-token": action.payload.continuationToken,
        is_debtor: action.payload.noticeCategory === "debtor" || undefined,
        is_payer: action.payload.noticeCategory === "payer" || undefined
      },
      "Authorization"
    );

    if (E.isLeft(getTransactionListResult)) {
      yield* put(
        getPaymentsNoticeAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(getTransactionListResult.left))
          )
        })
      );
      return;
    }
    if (getTransactionListResult.right.status === 200) {
      const continuationToken = pipe(
        getTransactionListResult.right.headers,
        NoticeHeaders.decode,
        E.map(headers => headers.map["x-continuation-token"]),
        E.getOrElseW(() => undefined)
      );
      action.payload.onSuccess?.(continuationToken);
      yield* put(
        getPaymentsNoticeAction.success({
          data: getTransactionListResult.right.value.notices,
          appendElements: action.payload.firstLoad
        })
      );
    } else if (getTransactionListResult.right.status === 404) {
      yield* put(getPaymentsNoticeAction.success({ data: [] }));
    } else if (getTransactionListResult.right.status !== 401) {
      // The 401 status returned from all the pagoPA APIs need to reset the session token before refreshing the token

      yield* put(
        getPaymentsNoticeAction.failure({
          ...getGenericError(
            new Error(
              `response status code ${getTransactionListResult.right.status}`
            )
          )
        })
      );
    }
  } catch (e) {
    yield* put(getPaymentsNoticeAction.failure({ ...getNetworkError(e) }));
  }
}
