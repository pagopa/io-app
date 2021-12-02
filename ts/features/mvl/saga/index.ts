import { SagaIterator } from "redux-saga";
import { call, takeLatest } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { SessionToken } from "../../../types/SessionToken";
import { waitBackoffError } from "../../../utils/backoffError";
import { mvlDetailsLoad } from "../store/actions";
import { handleGetMvl } from "./networking/handleGetMvlDetails";

/**
 * Handle the MVL Requests
 * TODO: stub entrypoint
 * @param _
 */
export function* watchMvlSaga(_: SessionToken): SagaIterator {
  // TODO: backendClient
  // const mvlClient = MvlClient(apiUrlPrefix, bearerToken);

  // handle the request for a new mvlDetailsLoad
  yield takeLatest(
    mvlDetailsLoad.request,
    function* (action: ActionType<typeof mvlDetailsLoad.request>) {
      // wait backoff time it there were previous errors
      yield call(waitBackoffError, mvlDetailsLoad.failure);
      yield call(handleGetMvl, null, action);
    }
  );
}
