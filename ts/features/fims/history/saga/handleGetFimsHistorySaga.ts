import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { FimsHistoryClient } from "../api/client";
import { fimsHistoryGet } from "../store/actions";

export function* handleGetFimsHistorySaga(
  getFimsHistory: FimsHistoryClient["getConsents"],
  bearerToken: string,
  action: ActionType<typeof fimsHistoryGet.request>
) {
  const getHistoryRequest = getFimsHistory({
    Bearer: bearerToken,
    continuationToken: action.payload.continuationToken
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
    yield* put(resultAction);
  } catch (e) {
    yield* put(fimsHistoryGet.failure((e as Error).toString()));
  }
}

const extractFimsHistoryResponseAction = (
  historyResult: SagaCallReturnType<FimsHistoryClient["getConsents"]>
) =>
  pipe(
    historyResult,
    E.fold(
      error => fimsHistoryGet.failure(error.toString()),
      response =>
        response.status === 200
          ? fimsHistoryGet.success(response.value)
          : fimsHistoryGet.failure("GENERIC_NON_200")
    )
  );
