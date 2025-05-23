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

const CONNECTIVITY_STATUS_LOAD_INTERVAL = (60 * 1000) as Millisecond;
const CONNECTIVITY_STATUS_FAILURE_INTERVAL = (10 * 1000) as Millisecond;

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
      const libraryResponse = yield* call(fetchNetInfoState());
      const backendResponse = yield* call(client.getPing, {});

      if (E.isRight(libraryResponse) && E.isRight(backendResponse)) {
        const isAppConnected =
          libraryResponse.right.isConnected &&
          backendResponse.right.status === 204;
        // App is connected update the store and wait for the next check
        yield* put(setConnectionStatus(true));

        // update mixpanel super properties
        const state = (yield* select()) as GlobalState;
        void updateMixpanelSuperProperties(state);

        if (isAppConnected) {
          yield* call(startTimer, CONNECTIVITY_STATUS_LOAD_INTERVAL);
          continue;
        }
        yield* call(startTimer, CONNECTIVITY_STATUS_FAILURE_INTERVAL);
        continue;
      }
      yield* call(startTimer, CONNECTIVITY_STATUS_FAILURE_INTERVAL);
      continue;
    } catch (e) {
      yield* call(startTimer, CONNECTIVITY_STATUS_FAILURE_INTERVAL);
      continue;
    }
  }
}

export default function* root(): IterableIterator<ReduxSagaEffect> {
  const client = yield* call(createConnectivityClient, apiUrlPrefix);
  yield* fork(connectionStatusSaga, client);
}
