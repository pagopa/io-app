import { call, put } from "typed-redux-saga/macro";
import { ReduxSagaEffect, SagaCallReturnType } from "../../../../types/utils";
import { convertUnknownToError } from "../../../../utils/errors";
import { itwNfcIsEnabled } from "../store/actions";
import * as cieUtils from "../../../authentication/login/cie/utils/cie";

export function* checkNfcEnabledSaga(): Generator<ReduxSagaEffect, void> {
  try {
    const isNfcEnabled: SagaCallReturnType<typeof cieUtils.isNfcEnabled> =
      yield* call(cieUtils.isNfcEnabled);
    yield* put(itwNfcIsEnabled.success(isNfcEnabled));
  } catch (e) {
    yield* put(itwNfcIsEnabled.failure(convertUnknownToError(e)));
  }
}
