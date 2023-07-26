import { SagaIterator } from "redux-saga";
import { call, put, select } from "typed-redux-saga/macro";
import { isSome } from "fp-ts/lib/Option";
import {
  itwCredentialsAddPid,
  itwLifecycleValid,
  itwWiaRequest
} from "../store/actions";
import { itwWiaSelector } from "../store/reducers/itwWia";
import { getPid } from "../utils/pid";
import { ItWalletErrorTypes } from "../utils/errors/itwErrors";

/*
 * This saga handles adding new credentials to the wallet.
 * Currenly it consists of a delay and then dispatches the success action, due to the credential being mocked.
 */
export function* handleCredentialsAddPid(): SagaIterator {
  try {
    const wia = yield* select(itwWiaSelector);
    if (isSome(wia)) {
      const pid = yield* call(getPid, wia.value);
      yield* put(itwCredentialsAddPid.success(pid));
      yield* put(itwLifecycleValid());
    } else {
      yield* put(
        itwWiaRequest.failure({
          code: ItWalletErrorTypes.PID_ISSUING_ERROR
        })
      );
    }
  } catch {
    yield* put(
      itwWiaRequest.failure({
        code: ItWalletErrorTypes.PID_ISSUING_ERROR
      })
    );
  }
}
