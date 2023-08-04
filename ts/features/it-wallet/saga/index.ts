import { takeLatest, call } from "typed-redux-saga/macro";
import { SagaIterator } from "redux-saga";
import { CommonActions } from "@react-navigation/native";
import {
  itwActivationCompleted,
  itwActivationStart,
  itwActivationStop,
  itwWiaRequest
} from "../store/actions";
import NavigationService from "../../../navigation/NavigationService";
import { ITW_ROUTES } from "../navigation/ItwRoutes";
import { itwCredentialsAddPid, itwPid } from "../store/actions/credentials";
import ROUTES from "../../../navigation/routes";
import { itwDecodePid } from "./../store/actions/credentials";
import {
  handleStartAuthenticationSaga,
  handleStopAuthenticationSaga
} from "./authenticationSaga";
import { handlePidDecodeRequest, handlePidRequest } from "./pid";
import { handleWiaRequest } from "./wia";
import { handleCredentialsAddPid } from "./credentials";

export function* watchItwSaga(): SagaIterator {
  /**
   * Handles the ITW activation start.
   */
  yield* takeLatest(itwActivationStart, watchItwActivationStart);

  /**
   * Handles the ITW activation stop.
   */
  yield* takeLatest(itwActivationStop, watchItwActivationStop);

  /**
   * Handles the ITW activation completed.
   */
  yield* takeLatest(itwActivationCompleted, watchItwActivationCompleted);

  /**
   * Handles the wallet instance attestation issuing.
   */
  yield* takeLatest(itwWiaRequest.request, handleWiaRequest);

  /**
   * Handles a PID issuing request.
   */
  yield* takeLatest(itwPid.request, handlePidRequest);

  /**
   * Handles a PID decode request.
   */
  yield* takeLatest(itwDecodePid.request, handlePidDecodeRequest);

  /**
   * Handles adding a PID to the wallet.
   */
  yield* takeLatest(itwCredentialsAddPid.request, handleCredentialsAddPid);
}

function* watchItwActivationStart(): SagaIterator {
  yield* call(
    NavigationService.dispatchNavigationAction,
    CommonActions.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUING.PID_AUTH_INFO
    })
  );
  yield* call(handleStartAuthenticationSaga);
}

function* watchItwActivationStop(): SagaIterator {
  yield* call(
    NavigationService.dispatchNavigationAction,
    CommonActions.navigate(ROUTES.MAIN, {
      screen: ROUTES.MESSAGES_HOME
    })
  );
  yield* call(handleStopAuthenticationSaga);
}

function* watchItwActivationCompleted(): SagaIterator {
  yield* call(
    NavigationService.dispatchNavigationAction,
    CommonActions.navigate(ROUTES.MAIN, {
      screen: ROUTES.ITWALLET_HOME
    })
  );
  yield* call(handleStopAuthenticationSaga);
}
