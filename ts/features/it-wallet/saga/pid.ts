import { SagaIterator } from "redux-saga";
import { call, put, select } from "typed-redux-saga/macro";
import { isSome } from "fp-ts/lib/Option";
import { PID } from "@pagopa/io-react-native-wallet";
import { itwWiaSelector } from "../store/reducers/itwWia";
import { getPid } from "../utils/pid";
import { ItWalletErrorTypes } from "../utils/errors/itwErrors";
import { itwPid } from "../store/actions/credentials";

/*
 * This saga handles the PID issuing.
 * It calls the getPid function to get an encoded PID and then decodes it.
 */
export function* handlePidRequest(): SagaIterator {
  try {
    const wia = yield* select(itwWiaSelector);
    if (isSome(wia)) {
      const pid = yield* call(getPid, wia.value);
      const decodedPid = yield* call(PID.SdJwt.decode, pid.credential);
      yield* put(itwPid.success({ pid, decodedPid }));
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
