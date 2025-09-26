import { call, put } from "typed-redux-saga/macro";
import { CieUtils } from "@pagopa/io-react-native-cie";
import {
  ReduxSagaEffect,
  SagaCallReturnType
} from "../../../../../types/utils";
import { convertUnknownToError } from "../../../../../utils/errors";
import { itwHasNfcFeature } from "../store/actions";

export function* checkHasNfcFeatureSaga(): Generator<ReduxSagaEffect, void> {
  try {
    const hasNfcFeature: SagaCallReturnType<typeof CieUtils.hasNfcFeature> =
      yield* call(CieUtils.hasNfcFeature);
    yield* put(itwHasNfcFeature.success(hasNfcFeature));
  } catch (e) {
    yield* put(itwHasNfcFeature.failure(convertUnknownToError(e)));
  }
}
