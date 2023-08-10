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

  // The RP solution is initialized using the authReqUrl
  // of the qrcode payload
  const RP = new RelyingPartySolution(authReqUrl, wia.payload);

  yield* put(itwRpInitialization.request({ RP, authReqUrl }));

  // TODO: user should tap a button to start
  // the authorization flow with the RP
  // This could be done by dispatching an action
  // yielded by a take

  yield* put(itwRpPresentation.request(RP));
}

export function* handleRpStop(): SagaIterator {
  // TODO: (ex. go back or reset stack navigation)
}

export function* handleRpCompleted(): SagaIterator {
  // TODO: (ex. show a typ)
}
