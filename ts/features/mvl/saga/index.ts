import { SagaIterator } from "redux-saga";
import { call, takeLatest } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SessionToken } from "../../../types/SessionToken";
import { waitBackoffError } from "../../../utils/backoffError";
import { mvlDetailsLoad } from "../store/actions";
import { BackendMvlClient } from "../api/backendMvl";
import { apiUrlPrefix } from "../../../config";
import { handleGetMvl } from "./networking/handleGetMvlDetails";

/**
 * Handle the MVL Requests
 * @param bearerToken
 */
export function* watchMvlSaga(bearerToken: SessionToken): SagaIterator {
  const mvlClient = BackendMvlClient(apiUrlPrefix, bearerToken);

  // handle the request for a new mvlDetailsLoad
  yield* takeLatest(
    mvlDetailsLoad.request,
    function* (action: ActionType<typeof mvlDetailsLoad.request>) {
      // wait backoff time if there were previous errors
      yield* call(waitBackoffError, mvlDetailsLoad.failure);
      yield* call(handleGetMvl, mvlClient.getUserLegalMessage, action);
    }
  );
}

// After making the features.MVL non-persistent
// because it is no longer necessary, the persist:mvl
// must be manually removed from AsyncStorage.
// If an error occurs while deleting, because the key is
// invalid or not present, it is not necessary
// to handle the exception
export function* removePersistMvl() {
  try {
    yield* call(AsyncStorage.removeItem, "persist:mvl");
  } finally {
    // nothing to do
  }
}
