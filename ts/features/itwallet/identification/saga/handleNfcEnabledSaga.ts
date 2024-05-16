import { call, put } from "typed-redux-saga/macro";
import { SagaCallReturnType } from "../../../../types/utils";
import { convertUnknownToError } from "../../../../utils/errors";
import { itwIsNfcEnabled } from "../../common/utils/itwCieUtils";
import { itwNfcIsEnabled } from "../store/actions";

export function* handleNfcEnabledSaga() {
  try {
    const isNfcEnabled: SagaCallReturnType<typeof itwIsNfcEnabled> =
      yield* call(itwIsNfcEnabled);
    yield* put(itwNfcIsEnabled.success(isNfcEnabled));
  } catch (e) {
    yield* put(itwNfcIsEnabled.failure(convertUnknownToError(e)));
  }
}
