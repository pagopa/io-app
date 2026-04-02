import * as E from "fp-ts/lib/Either";
import { call, delay, fork, put, select, take } from "typed-redux-saga/macro";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { ActionType } from "typesafe-actions";
import { fetchNetInfoState } from "../utils";
import { setConnectionStatus } from "../store/actions";
import { ReduxSagaEffect, SagaCallReturnType } from "../../../types/utils";
import { updateMixpanelSuperProperties } from "../../../mixpanelConfig/superProperties";
import { GlobalState } from "../../../store/reducers/types";
import { ConnectivityClient, createConnectivityClient } from "../api/client";
import { apiUrlPrefix } from "../../../config";
import { appCurrentStateSelector } from "../../../store/reducers/appState";
import { applicationChangeState } from "../../../store/actions/application";

const CONNECTIVITY_STATUS_LOAD_INTERVAL = (30 * 1000) as Millisecond;
const CONNECTIVITY_STATUS_FAILURE_INTERVAL = (10 * 1000) as Millisecond;

function* waitForAppActive(): Generator<
  ReduxSagaEffect,
  void,
  ActionType<typeof applicationChangeState>
> {
  while (true) {
    const appStateChange = yield* take(applicationChangeState);
    if (appStateChange.payload === "active") {
      return;
    }
  }
}

function* checkBackendConnectionStatus(
  client: ConnectivityClient
): Generator<ReduxSagaEffect, boolean, unknown> {
  try {
    const response = yield* call(client.getPing, {});
    return E.isRight(response) && response.right.status === 204;
  } catch (e) {
    return false;
  }
}

/**
 * this saga requests and checks the connection status
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
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
    } catch (e) {
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
