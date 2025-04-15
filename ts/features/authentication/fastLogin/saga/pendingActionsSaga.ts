import { SagaIterator } from "redux-saga";
import {
  put,
  race,
  select,
  take,
  takeLatest,
  delay
} from "typed-redux-saga/macro";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { applicationInitialized } from "../../../../store/actions/application";
import { clearPendingAction } from "../store/actions/tokenRefreshActions";
import { fastLoginPendingActionsSelector } from "../store/selectors";
import { isDevEnv } from "../../../../utils/environment";

const ACTION_TO_WAIT_FOR_TIMEOUT = 3000 as Millisecond;

export function* watchPendingActionsSaga(): SagaIterator {
  yield* takeLatest(applicationInitialized, handleApplicationInitialized);
}

function* handleApplicationInitialized(
  _: ReturnType<typeof applicationInitialized>
) {
  const { actionsToWaitFor } = _.payload;
  const pendingActions = yield* select(fastLoginPendingActionsSelector);
  // if there are no pending actions,
  // we don't need to wait for anything,
  // because there is no saga to restart
  // with the pending actions
  if (pendingActions.length === 0) {
    return;
  }
  // If there are pending actions,
  // we wait for the actionsToWaitFor, if any,
  // and then we dispatch the pending actions.
  for (const action of actionsToWaitFor) {
    // If for some reason the action is dispatched before
    // we start waiting for it, we are stuck here.
    // So we need to handle this race contion.
    yield* race({
      take: take(action),
      timeout: delay(ACTION_TO_WAIT_FOR_TIMEOUT)
    });
  }
  for (const action of pendingActions) {
    yield* put(action);
  }
  yield* put(clearPendingAction());
}

export const testableHandleApplicationInitialized = isDevEnv
  ? {
      handleApplicationInitialized
    }
  : undefined;
