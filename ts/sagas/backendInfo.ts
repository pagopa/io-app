import { Either } from "fp-ts/lib/Either";
import { BasicResponseType } from "italia-ts-commons/lib/requests";
import { call, Effect, fork, put } from "redux-saga/effects";

import { ServerInfo } from "../../definitions/backend/ServerInfo";
import { BackendPublicClient } from "../api/backendPublic";
import { setInstabugUserAttribute } from "../boot/configureInstabug";
import { apiUrlPrefix } from "../config";
import {
  backendInfoLoadFailure,
  backendInfoLoadSuccess
} from "../store/actions/backendInfo";
import { SagaCallReturnType } from "../types/utils";
import { startTimer } from "../utils/timer";

// load backend info every hour
const BACKEND_INFO_LOAD_INTERVAL = 60 * 60 * 1000;

// retry loading backend info every 10 seconds on error
const BACKEND_INFO_RETRY_INTERVAL = 60 * 60 * 10 * 1000;

function* backendInfoWatcher(): IterableIterator<Effect> {
  const backendPublicClient = BackendPublicClient(apiUrlPrefix);

  function getServerInfo(): Promise<
    Either<Error, BasicResponseType<ServerInfo>>
  > {
    return new Promise((resolve, _) =>
      backendPublicClient.getServerInfo({}).then(
        x => {
          return x;
        },
        () => resolve(undefined)
      )
    );
  }

  while (true) {
    const backendInfoResponse: SagaCallReturnType<
      typeof getServerInfo
    > = yield call(getServerInfo, {});

    if (
      backendInfoResponse.isRight() &&
      backendInfoResponse.value.status === 200
    ) {
      yield put(backendInfoLoadSuccess(backendInfoResponse.value.value));
      setInstabugUserAttribute(
        "backendVersion",
        backendInfoResponse.value.value.version
      );
      // tslint:disable-next-line:saga-yield-return-type
      yield call(startTimer, BACKEND_INFO_LOAD_INTERVAL);
    } else {
      yield put(backendInfoLoadFailure(new Error("Cannot read server info")));
      // tslint:disable-next-line:saga-yield-return-type
      yield call(startTimer, BACKEND_INFO_RETRY_INTERVAL);
    }
  }
}

export default function* root(): IterableIterator<Effect> {
  yield fork(backendInfoWatcher);
}
