import BackgroundFetch from "react-native-background-fetch";
import { call } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { checkWalletInstanceAndCredentialsValiditySaga } from "../../itwallet/common/saga";
import { backgroundFetchEvent } from "../store/actions";
import { BackgroundFetchTaskId } from "../utils/tasks";

/**
 * Saga responsible for handling background fetch events triggered by the react-native-background-fetch package.
 *
 * IMPORTANT: All background tasks MUST call BackgroundFetch.finish(taskId) when complete
 * to properly release system resources and prevent task timeouts.
 */
export function* handleBackgroundFetchEventSaga(
  action: ActionType<typeof backgroundFetchEvent>
) {
  switch (action.payload) {
    case BackgroundFetchTaskId.REACT_NATIVE_BACKGROUND_FETCH:
      // This event is called by the react-native-background-fetch package
      // with the interval configured in useBackgroundFetch hook
      yield* call(checkWalletInstanceAndCredentialsValiditySaga);
      break;
    case BackgroundFetchTaskId.ITW_CHECK:
      break;
  }

  // IMPORTANT: all tasks, when finished, must call BackgroundFetch.finish(taskId)
  yield* call(BackgroundFetch.finish, action.payload);
}
