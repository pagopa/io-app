import { delay } from "redux-saga";
import { call, Effect, fork, put } from "redux-saga/effects";

import { BasicResponseType } from "italia-ts-commons/lib/requests";

import { ServerInfo } from "../../definitions/backend/ServerInfo";
import { BackendPublicClient } from "../api/backendPublic";
import { apiUrlPrefix } from "../config";
import {
  backendInfoLoadFailure,
  backendInfoLoadSuccess
} from "../store/actions/backendInfo";

// load backend info every hour
const BACKEND_INFO_LOAD_INTERVAL = 60 * 60 * 1000;

// retry loading backend info every 5 seconds on error
const BACKEND_INFO_RETRY_INTERVAL = 10 * 1000;

export function* backendInfoWatcher(): IterableIterator<Effect> {
  const backendPublicClient = BackendPublicClient(apiUrlPrefix);
  const getServerInfo = backendPublicClient.getServerInfo;

  while (true) {
    const backendInfoResponse:
      | BasicResponseType<ServerInfo>
      | undefined = yield call(getServerInfo, {});

    if (backendInfoResponse && backendInfoResponse.status === 200) {
      yield put(backendInfoLoadSuccess(backendInfoResponse.value));
      // tslint:disable-next-line:saga-yield-return-type
      yield call(delay, BACKEND_INFO_LOAD_INTERVAL);
    } else {
      yield put(backendInfoLoadFailure(new Error("Cannot read server info")));
      // tslint:disable-next-line:saga-yield-return-type
      yield call(delay, BACKEND_INFO_RETRY_INTERVAL);
    }
  }
}

export default function* root(): IterableIterator<Effect> {
  yield fork(backendInfoWatcher);
}
