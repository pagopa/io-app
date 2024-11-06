import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType, isActionOf } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { FimsHistoryClient } from "../api/client";
import { fimsHistoryGet } from "../store/actions";
import { trackHistoryFailure } from "../../common/analytics";

export function* handleGetFimsHistorySaga(
  getFimsHistory: FimsHistoryClient["getAccessHistory"],
  bearerToken: string,
  action: ActionType<typeof fimsHistoryGet.request>
) {
  // TODO Accept-Language
  const getHistoryRequest = getFimsHistory({
    Bearer: bearerToken,
    page: action.payload.continuationToken
  });

  try {
    const getHistoryResult = (yield* call(
      withRefreshApiCall,
      getHistoryRequest,
      action
    )) as SagaCallReturnType<typeof getFimsHistory>;

    const resultAction = yield* call(
      extractFimsHistoryResponseAction,
      getHistoryResult
    );
    trackFailureIfNeeded(resultAction);
    yield* put(resultAction);
  } catch (e) {
    const reason = JSON.stringify(e);
    trackHistoryFailure(reason);
    yield* put(fimsHistoryGet.failure(reason));
  }
}

const extractFimsHistoryResponseAction = (
  historyResult: SagaCallReturnType<FimsHistoryClient["getAccessHistory"]>
) =>
  pipe(
    historyResult,
    E.fold(
      error => fimsHistoryGet.failure(readableReportSimplified(error)),
      response =>
        response.status === 200
          ? fimsHistoryGet.success(response.value)
          : fimsHistoryGet.failure(`GENERIC_NON_200: ${response.status}`)
    )
  );

const trackFailureIfNeeded = (
  action: ActionType<
    typeof fimsHistoryGet.success | typeof fimsHistoryGet.failure
  >
) => {
  if (isActionOf(fimsHistoryGet.failure, action)) {
    const reason = action.payload;
    trackHistoryFailure(reason);
  }
};
