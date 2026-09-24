import { Millisecond } from "@pagopa/ts-commons/lib/units";
import * as E from "fp-ts/lib/Either";
import { Action } from "redux";
import {
  call,
  delay,
  fork,
  put,
  race,
  select,
  take
} from "typed-redux-saga/macro";
import { isActionOf } from "typesafe-actions";

import { apiUrlPrefix } from "../../../config";
import { updateMixpanelSuperProperties } from "../../../mixpanelConfig/superProperties";
import { applicationChangeState } from "../../../store/actions/application";
import { appCurrentStateSelector } from "../../../store/reducers/appState";
import { GlobalState } from "../../../store/reducers/types";
import { ReduxSagaEffect, SagaCallReturnType } from "../../../types/utils";
import { ConnectivityClient, createConnectivityClient } from "../api/client";
import { setConnectionStatus } from "../store/actions";
import { fetchNetInfoState } from "../utils";

const CONNECTIVITY_STATUS_LOAD_INTERVAL = (30 * 1000) as Millisecond;
const CONNECTIVITY_STATUS_FAILURE_INTERVAL = (10 * 1000) as Millisecond;

/** This saga requests and checks the connection status */
export function* connectionStatusSaga(
  client: ConnectivityClient
): Generator<
  ReduxSagaEffect,
  boolean,
  SagaCallReturnType<typeof fetchNetInfoState>
> {
  while (true) {
    try {
      const appState = yield* select(appCurrentStateSelector);

      if (appState !== "active") {
        yield* call(waitForAppActive);
        continue;
      }

      const libraryResponse = yield* call(fetchNetInfoState());

      const statePostNetInfo = yield* select(appCurrentStateSelector);
      if (statePostNetInfo !== "active") {
        yield* call(waitForAppActive);
        continue;
      }

      if (E.isRight(libraryResponse)) {
        const backendResponse = yield* call(
          checkBackendConnectionStatus,
          client
        );

        const statePostAwait = yield* select(appCurrentStateSelector);
        if (statePostAwait !== "active") {
          yield* call(waitForAppActive);
          continue;
        }
        const isAppConnected =
          !!libraryResponse.right.isConnected && backendResponse;

        // App is connected update the store and wait for the next check
        yield* put(setConnectionStatus(isAppConnected));

        // update mixpanel super properties
        const state: GlobalState = yield* select();
        void updateMixpanelSuperProperties(state);
        if (isAppConnected) {
          yield* delay(CONNECTIVITY_STATUS_LOAD_INTERVAL);
          continue;
        }
      } else {
        // NetInfo read failed: keep store aligned with failure handling.
        yield* put(setConnectionStatus(false));
      }
      yield* delay(CONNECTIVITY_STATUS_FAILURE_INTERVAL);
      continue;
    } catch {
      // we ignore errors and treat them as a connection failure
      yield* put(setConnectionStatus(false));
    }
    yield* delay(CONNECTIVITY_STATUS_FAILURE_INTERVAL);
  }
}

export default function* root(): IterableIterator<ReduxSagaEffect> {
  const client = yield* call(createConnectivityClient, apiUrlPrefix);
  yield* fork(connectionStatusSaga, client);
}

function* checkBackendConnectionStatus(
  client: ConnectivityClient
): Generator<ReduxSagaEffect, boolean, unknown> {
  try {
    const response = yield* call(client.getPing, {});
    return E.isRight(response) && response.right.status === 204;
  } catch {
    return false;
  }
}

function* waitForAppActive() {
  yield* race({
    delay: delay(CONNECTIVITY_STATUS_FAILURE_INTERVAL),
    applicationActive: take(
      (action: Action) =>
        isActionOf(applicationChangeState, action) &&
        action.payload === "active"
    )
  });
}
