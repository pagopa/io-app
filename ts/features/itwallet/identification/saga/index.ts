import { call, put } from "typed-redux-saga/macro";
import cieManager from "@pagopa/react-native-cie";
import { ReduxSagaEffect, SagaCallReturnType } from "../../../../types/utils";
import { convertUnknownToError } from "../../../../utils/errors";
import { itwHasNfcFeature } from "../store/actions";

export function* checkHasNfcFeatureSaga(): Generator<ReduxSagaEffect, void> {
  try {
    const hasNFCFeature: SagaCallReturnType<typeof cieManager.hasNFCFeature> =
      yield* call(cieManager.hasNFCFeature);
    yield* put(itwHasNfcFeature.success(hasNFCFeature));
  } catch (e) {
    yield* put(itwHasNfcFeature.failure(convertUnknownToError(e)));
  }
}
