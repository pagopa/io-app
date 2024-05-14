import cieManager from "@pagopa/react-native-cie";
import { call, put } from "typed-redux-saga/macro";
import { SagaCallReturnType } from "../../../../types/utils";
import { convertUnknownToError } from "../../../../utils/errors";
import { itwNfcIsEnabled } from "../store/actions";

export function* handleNfcEnabledSaga() {
  try {
    const isNfcEnabled: SagaCallReturnType<typeof cieManager.isNFCEnabled> =
      yield* call(cieManager.isNFCEnabled);
    yield* put(itwNfcIsEnabled.success(isNfcEnabled));
  } catch (e) {
    yield* put(itwNfcIsEnabled.failure(convertUnknownToError(e)));
  }
}
