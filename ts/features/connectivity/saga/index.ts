import * as E from "fp-ts/lib/Either";
import { call, fork, put, select } from "typed-redux-saga/macro";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { fetchNetInfoState } from "../utils";
import { startTimer } from "../../../utils/timer";
import { setConnectionStatus } from "../store/actions";
import { ReduxSagaEffect, SagaCallReturnType } from "../../../types/utils";
import { updateMixpanelSuperProperties } from "../../../mixpanelConfig/superProperties";
import { GlobalState } from "../../../store/reducers/types";
import { ConnectivityClient, createConnectivityClient } from "../api/client";
import { apiUrlPrefix } from "../../../config";
import { appStateSelector } from "../../../store/reducers/appState";

const CONNECTIVITY_STATUS_LOAD_INTERVAL = (30 * 1000) as Millisecond;
const CONNECTIVITY_STATUS_FAILURE_INTERVAL = (10 * 1000) as Millisecond;

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
export function* connectionStatusSaga(
  client: ConnectivityClient
): Generator<
  ReduxSagaEffect,
  boolean,
  SagaCallReturnType<typeof fetchNetInfoState>
> {
  while (true) {
    try {
      const appState = yield* select(appStateSelector);

      if (appState.appState !== "active") {
        // if the app is not active we wait for the next check
        yield* call(startTimer, CONNECTIVITY_STATUS_LOAD_INTERVAL);
        continue;
      }
      const libraryResponse = yield* call(fetchNetInfoState());

      if (E.isRight(libraryResponse)) {
        const backendResponse = yield* call(
          checkBackendConnectionStatus,
          client
        );

        const isAppConnected =
          !!libraryResponse.right.isConnected && backendResponse;

        // App is connected update the store and wait for the next check
        yield* put(setConnectionStatus(isAppConnected));

        // update mixpanel super properties
        const state = (yield* select()) as GlobalState;
        void updateMixpanelSuperProperties(state);

        if (isAppConnected) {
          yield* call(startTimer, CONNECTIVITY_STATUS_LOAD_INTERVAL);
          continue;
        }
      }
    } finally {
      yield* call(startTimer, CONNECTIVITY_STATUS_FAILURE_INTERVAL);
    }
  }
}

export default function* root(): IterableIterator<ReduxSagaEffect> {
  const client = yield* call(createConnectivityClient, apiUrlPrefix);
  yield* fork(connectionStatusSaga, client);
}
