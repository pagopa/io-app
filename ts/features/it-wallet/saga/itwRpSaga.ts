import { SagaIterator } from "redux-saga";
import { call, put, select, take, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { RelyingPartySolution } from "@pagopa/io-react-native-wallet";
import { CommonActions } from "@react-navigation/native";
import {
  itwRpCompleted,
  itwRpInitialization,
  itwRpPresentation,
  itwRpStart,
  itwRpStop,
  itwRpUserConfirmed,
  itwRpUserRejected
} from "../store/actions/itwRpActions";
import { itwWiaRequest } from "../store/actions/itwWiaActions";
import NavigationService from "../../../navigation/NavigationService";
import ROUTES from "../../../navigation/routes";
import { itwPidValueSelector } from "../store/reducers/itwPidReducer";
import { itwDecodePid } from "../store/actions/itwCredentialsActions";
import { handleItwRpInitializationSaga } from "./itwRpInitialization";
import { handleItwRpPresentationSaga } from "./itwRpPresentation";

/**
 * Watcher for the IT wallet Relying Party related sagas.
 */
export function* watchItwRpSaga(): SagaIterator {
  /**
   * Handles the ITW RP start.
   */
  yield* takeLatest(itwRpStart, handleRpStart);

  /**
   * Handles the ITW RP initialization flow.
   */
  yield* takeLatest(itwRpInitialization.request, handleItwRpInitializationSaga);

  /**
   * Handles the ITW RP presentation flow.
   */
  yield* takeLatest(itwRpPresentation.request, handleItwRpPresentationSaga);

  /**
   * Handles the ITW RP stop.
   */
  yield* takeLatest(itwRpStop, handleRpStop);

  /**
   * Handles the ITW RP completed.
   */
  yield* takeLatest(itwRpCompleted, handleRpCompleted);
}

export function* handleRpStart(
  action: ActionType<typeof itwRpStart>
): SagaIterator {
  const authReqUrl = action.payload;

  // Get WIA
  yield* call(itwWiaRequest.request);
  const wia = yield* take(itwWiaRequest.success);

  // Decode PID
  const pid = yield* select(itwPidValueSelector);
  yield* call(itwDecodePid.request, pid);
  const decodedRes = yield* take<
    ActionType<typeof itwWiaRequest.success | typeof itwWiaRequest.failure>
  >([itwWiaRequest.success, itwWiaRequest.failure]);
  if (decodedRes.type === getType(itwWiaRequest.failure)) {
    yield* put(itwRpStop());
  }

  // The RP solution is initialized using the authReqUrl
  // of the qrcode payload
  const RP = new RelyingPartySolution(authReqUrl, wia.payload);

  yield* put(itwRpInitialization.request({ RP, authReqUrl }));

  const result = yield* take([itwRpUserConfirmed, itwRpUserRejected]);
  if (result.type === getType(itwRpUserConfirmed)) {
    yield* put(itwRpPresentation.request(RP));
  } else {
    yield* put(itwRpStop());
  }
}

/**
 * On RP stop, the user is redirected to the IT wallet home.
 */
export function* handleRpStop(): SagaIterator {
  yield* call(
    NavigationService.dispatchNavigationAction,
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.ITWALLET_HOME
    })
  );
}

export function* handleRpCompleted(): SagaIterator {
  // TODO: (ex. show a typ)
}
