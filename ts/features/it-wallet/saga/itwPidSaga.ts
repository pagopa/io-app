import { SagaIterator } from "redux-saga";
import { call, put, select, takeLatest } from "typed-redux-saga/macro";
import { isSome } from "fp-ts/lib/Option";
import { PID } from "@pagopa/io-react-native-wallet";
import { ActionType } from "typesafe-actions";
import * as O from "fp-ts/lib/Option";
import { itwWiaSelector } from "../store/reducers/itwWiaReducer";
import { getPid } from "../utils/pid";
import { ItWalletErrorTypes } from "../utils/itwErrorsUtils";
import {
  itwCredentialsAddPid,
  itwDecodePid,
  itwPid
} from "../store/actions/itwCredentialsActions";
import { itwLifecycleValid } from "../store/actions/itwLifecycleActions";
import { verifyPin } from "./itwSagaUtils";

/**
 * Watcher for the IT wallet PID related sagas.
 */
export function* watchPidSaga(): SagaIterator {
  /**
   * Handles a PID issuing request.
   */
  yield* takeLatest(itwPid.request, handlePidRequest);

  yield* takeLatest(itwDecodePid.request, handlePidDecodeRequest);

  /**
   * Handles adding a PID to the wallet.
   */
  yield* takeLatest(itwCredentialsAddPid.request, handleCredentialsAddPid);
}

/*
 * This saga handles the PID issuing.
 * It calls the getPid function to get an encoded PID.
 */
export function* handlePidRequest(
  action: ActionType<typeof itwPid.request>
): SagaIterator {
  try {
    const wia = yield* select(itwWiaSelector);
    if (isSome(wia)) {
      const pid = yield* call(getPid, wia.value, action.payload);
      yield* put(itwPid.success(pid));
    } else {
      yield* put(
        itwPid.failure({
          code: ItWalletErrorTypes.PID_ISSUING_ERROR
        })
      );
    }
  } catch (err) {
    yield* put(
      itwPid.failure({
        code: ItWalletErrorTypes.PID_ISSUING_ERROR
      })
    );
  }
}

/*
 * This saga handles the PID decoding.
 * It calls the decode function to get a decoded PID.
 */
export function* handlePidDecodeRequest(
  action: ActionType<typeof itwDecodePid.request>
): SagaIterator {
  try {
    if (isSome(action.payload)) {
      const decodedPid = yield* call(
        PID.SdJwt.decode,
        action.payload.value.credential
      );
      yield* put(itwDecodePid.success(O.some(decodedPid)));
    } else {
      throw new Error();
    }
  } catch (err) {
    yield* put(
      itwDecodePid.failure({
        code: ItWalletErrorTypes.PID_DECODING_ERROR
      })
    );
  }
}

/*
 * This saga handles adding a PID to the wallet.
 * As a side effect, it sets the lifecycle of the wallet to valid.
 */
export function* handleCredentialsAddPid(
  action: ActionType<typeof itwCredentialsAddPid.request>
): SagaIterator {
  yield* call(verifyPin);
  const pid = action.payload;
  if (O.isSome(pid)) {
    yield* put(itwCredentialsAddPid.success(pid.value));
    yield* put(itwLifecycleValid());
  } else {
    yield* put(
      itwCredentialsAddPid.failure({
        code: ItWalletErrorTypes.CREDENTIAL_ADD_ERROR
      })
    );
  }
}
