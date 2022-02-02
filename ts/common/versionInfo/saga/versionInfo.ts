import { left } from "fp-ts/lib/Either";
import * as t from "io-ts";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { BasicResponseType } from "italia-ts-commons/lib/requests";
import { call, Effect, fork, put } from "redux-saga/effects";
import { VersionInfo } from "../../../../definitions/content/VersionInfo";
import { ContentClient } from "../../../api/content";
import { SagaCallReturnType } from "../../../types/utils";
import { startTimer } from "../../../utils/timer";
import {
  versionInfoLoadFailure,
  versionInfoLoadSuccess
} from "../store/actions/versionInfo";

// load version info every hour
const VERSION_INFO_LOAD_INTERVAL = 60 * 60 * 1000;

// retry loading version info every 10 seconds on error
const VERSION_INFO_RETRY_INTERVAL = 10 * 1000;

function* versionInfoWatcher(): Generator<Effect, void, any> {
  const contentClient = ContentClient();

  function getServerInfo(): Promise<
    t.Validation<BasicResponseType<VersionInfo>>
  > {
    return new Promise((resolve, _) =>
      contentClient
        .getVersionInfo()
        .then(resolve, e => resolve(left([{ context: [], value: e }])))
    );
  }

  while (true) {
    try {
      const versionInfoResponse: SagaCallReturnType<typeof getServerInfo> =
        yield call(getServerInfo);
      if (
        versionInfoResponse.isRight() &&
        versionInfoResponse.value.status === 200
      ) {
        yield put(versionInfoLoadSuccess(versionInfoResponse.value.value));
        yield call(startTimer, VERSION_INFO_LOAD_INTERVAL);
      } else {
        const errorDescription = versionInfoResponse.fold(
          readableReport,
          ({ status }) => `response status ${status}`
        );

        yield put(versionInfoLoadFailure(new Error(errorDescription)));

        yield call(startTimer, VERSION_INFO_RETRY_INTERVAL);
      }
    } catch (e) {
      yield put(versionInfoLoadFailure(new Error(e)));
    }
  }
}

export default function* versionInfoSaga(): IterableIterator<Effect> {
  yield fork(versionInfoWatcher);
}
