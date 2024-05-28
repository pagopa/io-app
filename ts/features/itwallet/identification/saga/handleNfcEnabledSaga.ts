import { call, put } from "typed-redux-saga/macro";
import { SagaCallReturnType } from "../../../../types/utils";
import { convertUnknownToError } from "../../../../utils/errors";
import { itwNfcIsEnabled } from "../store/actions";
import * as cieUtils from "../../../../utils/cie";

export function* handleNfcEnabledSaga() {
  try {
    const isNfcEnabled: SagaCallReturnType<typeof cieUtils.isNfcEnabled> =
      yield* call(cieUtils.isNfcEnabled);
    yield* put(itwNfcIsEnabled.success(isNfcEnabled));
  } catch (e) {
    yield* put(itwNfcIsEnabled.failure(convertUnknownToError(e)));
  }
}
