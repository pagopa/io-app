import { SagaIterator } from "redux-saga";
import { put, delay, takeLatest, select, call } from "typed-redux-saga/macro";
import {
  itwPrRemoteCredential,
  itwPrRemoteCredentialInit
} from "../store/actions/itwPrRemoteCredentialActions";
import { itwLifecycleIsValidSelector } from "../store/reducers/itwLifecycleReducer";
import { ItWalletErrorTypes } from "../utils/itwErrorsUtils";
import { verifyPin } from "../utils/itwSagaUtils";

export function* watchItwPrRemoteCredentialSaga(): SagaIterator {
  yield* takeLatest(
    itwPrRemoteCredentialInit.request,
    handleItwPrRemoteCredentialInitSaga
  );
  yield* takeLatest(
    itwPrRemoteCredential.request,
    handleItwPrRemoteCredentialSaga
  );
}

/*
 * This saga handles the RP presentation checks.
 * TODO: add the actual implementation as it currently only delays and returns success.
 * action: ActionType<typeof itwPrRemoteCredentialInit.request>
 */
export function* handleItwPrRemoteCredentialInitSaga(): SagaIterator {
  // Check if the lifecycle is valid
  const isItwLifecycleValid = yield* select(itwLifecycleIsValidSelector);
  if (!isItwLifecycleValid) {
    yield* put(
      itwPrRemoteCredentialInit.failure({
        code: ItWalletErrorTypes.WALLET_NOT_VALID_ERROR
      })
    );
    return;
  }
  yield* delay(1500);
  yield* put(itwPrRemoteCredentialInit.success());
}

/**
 * This saga handles the RP presentation.
 * TODO: add the actual implementation as it currently only delays and returns success.
 * action: ActionType<typeof itwPrRemoteCredential.request>
 */
export function* handleItwPrRemoteCredentialSaga(): SagaIterator {
  yield* call(verifyPin);
  yield* delay(1500);
  yield* put(itwPrRemoteCredential.success());
}
