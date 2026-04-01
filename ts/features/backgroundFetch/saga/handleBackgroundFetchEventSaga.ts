import BackgroundFetch from "react-native-background-fetch";
import { call, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { trackItwBackgroundFetchWakeUp } from "../../itwallet/analytics";
import { checkWalletInstanceAndCredentialsValiditySaga } from "../../itwallet/common/saga";
import { itwNeedWalletInstanceStatusCheck } from "../../itwallet/walletInstance/store/selectors";
import { backgroundFetchEvent } from "../store/actions";
import { BackgroundFetchTaskId } from "../utils/tasks";

/**
 * Saga responsible for handling background fetch events triggered by the
 * react-native-background-fetch package.
 *
 * Acts as a central router: each task ID is dispatched to the appropriate saga.
 *
 * IMPORTANT:
 * - Do NOT fork sagas here. Forked sagas may keep running after `finish()` is
 *   called, and may then be killed by the OS mid-execution.
 * - ALL task handlers MUST eventually call BackgroundFetch.finish(taskId) to
 *   release system resources and prevent OS-side task timeouts.
 */
export function* handleBackgroundFetchEventSaga(
  action: ActionType<typeof backgroundFetchEvent>
) {
  // Track background wake-up for observability (placeholder event)
  trackItwBackgroundFetchWakeUp();

  switch (action.payload) {
    case BackgroundFetchTaskId.REACT_NATIVE_BACKGROUND_FETCH: {
      const needCheck = yield* select(itwNeedWalletInstanceStatusCheck);
      if (needCheck) {
        yield* call(checkWalletInstanceAndCredentialsValiditySaga);
      }
      break;
    }
  }

  yield* call(BackgroundFetch.finish, action.payload);
}
