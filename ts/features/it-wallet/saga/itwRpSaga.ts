import { SagaIterator } from "redux-saga";
import { call, put, take, takeLatest } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { RelyingPartySolution } from "@pagopa/io-react-native-wallet";
import {
  itwRpCompleted,
  itwRpInitialization,
  itwRpPresentation,
  itwRpStart,
  itwRpStop
} from "../store/actions/itwRpActions";
import { itwWiaRequest } from "../store/actions/itwWiaActions";
import { handleItwRpInitializationSaga } from "./itwRpInitialization";
import { handleItwRpPresentationSaga } from "./itwRpPresentation";

/**
 * Watcher for the IT wallet activation related sagas.
 */
export function* watchItwRpSaga(): SagaIterator {
  /**
   * Handles the ITW activation start.
   */
  yield* takeLatest(itwRpStart, handleRpStart);

  /**
   * Handles the ITW initialization flow.
   */
  yield* takeLatest(itwRpInitialization.request, handleItwRpInitializationSaga);

  /**
   * Handles the ITW presentation flow.
   */
  yield* takeLatest(itwRpPresentation.request, handleItwRpPresentationSaga);

  /**
   * Handles the ITW activation stop.
   */
  yield* takeLatest(itwRpStop, handleRpStop);

  /**
   * Handles the ITW activation completed.
   */
  yield* takeLatest(itwRpCompleted, handleRpCompleted);
}

export function* handleRpStart(
  action: ActionType<typeof itwRpStart>
): SagaIterator {
  const authReqUrl = action.payload;

  // get WIA
  yield* call(itwWiaRequest.request);
  const wia = yield* take(itwWiaRequest.success);

  // The RP solution is initialized using the authReqUrl
  // of the qrcode payload
  const RP = new RelyingPartySolution(authReqUrl, wia.payload);

  yield* put(itwRpInitialization.request({ RP, authReqUrl }));

  // TODO: user tap button to start
  // yield* take(itwUserConfirmation);

  yield* put(itwRpPresentation.request(RP));
}

export function* handleRpStop(): SagaIterator {
  // stop (ex. go back or reset stack navigation)
}

export function* handleRpCompleted(): SagaIterator {
  // show a typ
}
