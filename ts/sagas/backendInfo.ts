import { left } from "fp-ts/lib/Either";
import * as t from "io-ts";
import { readableReport } from "italia-ts-commons/lib/reporters";
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
const BACKEND_INFO_RETRY_INTERVAL = 10 * 1000;

function* backendInfoWatcher(): Generator<
  Effect,
  void,
  SagaCallReturnType<typeof getServerInfo>
> {
  const backendPublicClient = BackendPublicClient(apiUrlPrefix);

  function getServerInfo(): Promise<
    t.Validation<BasicResponseType<ServerInfo>>
  > {
    return new Promise((resolve, _) =>
      backendPublicClient
        .getServerInfo({})
        .then(resolve, e => resolve(left([{ context: [], value: e }])))
    );
  }

  while (true) {
    try {
      const backendInfoResponse = yield call(getServerInfo);
      if (
        backendInfoResponse.isRight() &&
        backendInfoResponse.value.status === 200
      ) {
        yield put(backendInfoLoadSuccess(backendInfoResponse.value.value));
        setInstabugUserAttribute(
          "backendVersion",
          backendInfoResponse.value.value.version
        );
        // eslint-disable-next-line
        yield call(startTimer, BACKEND_INFO_LOAD_INTERVAL);
      } else {
        const errorDescription = backendInfoResponse.fold(
          readableReport,
          ({ status }) => `response status ${status}`
        );

        yield put(backendInfoLoadFailure(new Error(errorDescription)));

        // eslint-disable-next-line
        yield call(startTimer, BACKEND_INFO_RETRY_INTERVAL);
      }
    } catch (e) {
      yield put(backendInfoLoadFailure(new Error(e)));
    }
  }
}

export default function* root(): IterableIterator<Effect> {
  yield fork(backendInfoWatcher);
}
