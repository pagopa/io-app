import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";

import {
  itwRpInitialization,
  itwRpPresentation
} from "../store/actions/itwRpActions";
import { handleItwRpInitializationSaga } from "./itwRpInitializationSaga";
import { handleItwRpPresentationSaga } from "./itwRpPresentationSaga";

/**
 * Watcher for the IT wallet Relying Party related sagas.
 */
export function* watchItwRpSaga(): SagaIterator {
  /**
   * Handles the ITW RP initialization flow.
   */
  yield* takeLatest(itwRpInitialization.request, handleItwRpInitializationSaga);

  /**
   * Handles the ITW RP presentation flow.
   */
  yield* takeLatest(itwRpPresentation.request, handleItwRpPresentationSaga);
}
