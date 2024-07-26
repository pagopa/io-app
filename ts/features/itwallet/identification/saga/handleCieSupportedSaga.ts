import cieManager from "@pagopa/react-native-cie";
import { call, put } from "typed-redux-saga/macro";
import { convertUnknownToError } from "../../../../utils/errors";
import { itwCieIsSupported } from "../store/actions";

export function* handleCieSupportedSaga() {
  try {
    const response = yield* call(cieManager.isCIEAuthenticationSupported);
    yield* put(itwCieIsSupported.success(response));
  } catch (e) {
    yield* put(itwCieIsSupported.failure(convertUnknownToError(e)));
  }
}
