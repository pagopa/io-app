import { SagaIterator } from "redux-saga";
import { call, takeLatest } from "typed-redux-saga/macro";
import { CommonActions } from "@react-navigation/native";
import NavigationService from "../../../navigation/NavigationService";
import ROUTES from "../../../navigation/routes";

import {
  itwActivationCompleted,
  itwActivationStart,
  itwActivationStop
} from "../store/actions/itwActivationActions";
import { ITW_ROUTES } from "../navigation/ItwRoutes";
import {
  handleStartAuthenticationSaga,
  handleStopAuthenticationSaga
} from "./itwAuthenticationSaga";

/**
 * Watcher for the IT wallet activation related sagas.
 */
export function* watchItwActivationSaga(): SagaIterator {
  /**
   * Handles the ITW activation start.
   */
  yield* takeLatest(itwActivationStart, handleActivationStart);

  /**
   * Handles the ITW activation stop.
   */
  yield* takeLatest(itwActivationStop, handleActivationStop);

  /**
   * Handles the ITW activation completed.
   */
  yield* takeLatest(itwActivationCompleted, handleActivationCompleted);
}

export function* handleActivationStart(): SagaIterator {
  yield* call(
    NavigationService.dispatchNavigationAction,
    CommonActions.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO
    })
  );
  yield* call(handleStartAuthenticationSaga);
}

export function* handleActivationStop(): SagaIterator {
  yield* call(
    NavigationService.dispatchNavigationAction,
    CommonActions.navigate(ROUTES.MAIN, {
      screen: ROUTES.MESSAGES_HOME
    })
  );
  yield* call(handleStopAuthenticationSaga);
}

export function* handleActivationCompleted(): SagaIterator {
  yield* call(
    NavigationService.dispatchNavigationAction,
    CommonActions.navigate(ROUTES.MAIN, {
      screen: ROUTES.ITWALLET_HOME
    })
  );
  yield* call(handleStopAuthenticationSaga);
}
