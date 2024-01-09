import { SagaIterator } from "redux-saga";
import { put, delay, takeLatest, select, call } from "typed-redux-saga/macro";
import {
  itwPresentation,
  itwPresentationChecks
} from "../../store/actions/itwPresentationActions";
import { itwLifecycleIsValidSelector } from "../../store/reducers/itwLifecycleReducer";
import { ItWalletErrorTypes } from "../../utils/itwErrorsUtils";
import { verifyPin } from "../itwSagaUtils";

export function* watchItwPresentationSaga(): SagaIterator {
  yield* takeLatest(itwPresentationChecks.request, itwPresentationChecksSaga);
  yield* takeLatest(itwPresentation.request, itwPresentationSaga);
}

/*
 * This saga handles the RP presentation checks.
 * TODO: add the actual implementation as it currently only delays and returns success.
 * action: ActionType<typeof itwPresentationChecks.request>
 */
export function* itwPresentationChecksSaga(): SagaIterator {
  // Check if the lifecycle is valid
  const isItwLifecycleValid = yield* select(itwLifecycleIsValidSelector);
  if (!isItwLifecycleValid) {
    yield* put(
      itwPresentationChecks.failure({
        code: ItWalletErrorTypes.WALLET_NOT_VALID_ERROR
      })
    );
    return;
  }
  yield* delay(1500);
  yield* put(itwPresentationChecks.success());
}

/**
 * This saga handles the RP presentation.
 * TODO: add the actual implementation as it currently only delays and returns success.
 * action: ActionType<typeof itwPresentation.request>
 */
export function* itwPresentationSaga(): SagaIterator {
  yield* call(verifyPin);
  yield* delay(1500);
  yield* put(itwPresentation.success());
}
