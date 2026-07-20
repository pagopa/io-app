import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { BasicResponseType } from "@pagopa/ts-commons/lib/requests";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { call, fork, put } from "typed-redux-saga/macro";

import { VersionInfo } from "../../../../definitions/content/VersionInfo";
import { ContentClient } from "../../../api/content";
import { ReduxSagaEffect, SagaCallReturnType } from "../../../types/utils";
import { convertUnknownToError } from "../../../utils/errors";
import { startTimer } from "../../../utils/timer";
import {
  versionInfoLoadFailure,
  versionInfoLoadSuccess
} from "../store/actions/versionInfo";

// load version info every hour
const VERSION_INFO_LOAD_INTERVAL = 60 * 60 * 1000;

// retry loading version info every 10 seconds on error
const VERSION_INFO_RETRY_INTERVAL = 10 * 1000;

export default function* versionInfoSaga(): IterableIterator<ReduxSagaEffect> {
  yield* fork(versionInfoWatcher);
}

function* versionInfoWatcher(): Generator<ReduxSagaEffect, void, any> {
  const contentClient = ContentClient();

  function getVersionInfo(): Promise<
    t.Validation<BasicResponseType<VersionInfo>>
  > {
    return new Promise((resolve, _) => {
      void contentClient.getVersionInfo().then(
        value => {
          resolve(value);
        },
        e => {
          resolve(E.left([{ context: [], value: e }]));
        }
      );
    });
  }

  while (true) {
    try {
      const versionInfoResponse: SagaCallReturnType<typeof getVersionInfo> =
        yield* call(getVersionInfo);
      if (
        E.isRight(versionInfoResponse) &&
        versionInfoResponse.right.status === 200
      ) {
        yield* put(versionInfoLoadSuccess(versionInfoResponse.right.value));
        yield* call(startTimer, VERSION_INFO_LOAD_INTERVAL);
      } else {
        const errorDescription = pipe(
          versionInfoResponse,
          E.fold(readableReport, ({ status }) => `response status ${status}`)
        );

        yield* put(versionInfoLoadFailure(new Error(errorDescription)));

        yield* call(startTimer, VERSION_INFO_RETRY_INTERVAL);
      }
    } catch (e) {
      yield* put(versionInfoLoadFailure(convertUnknownToError(e)));
    }
  }
}
