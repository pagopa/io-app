import { SagaIterator } from "redux-saga";
import { call, put, select } from "typed-redux-saga/macro";
import { isSome } from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  hasApiLevelSupportSelector,
  hasNFCFeatureSelector
} from "../../../store/reducers/cie";
import { idpSelector } from "../../../store/reducers/authentication";
import { itwRequirementsRequest } from "../store/actions";

/*
 * A saga to post signature data.
 */
export function* handleRequirementsRequest(): SagaIterator {
  const state = yield* select();
  const idp = yield* call(idpSelector, state);
  if (isSome(idp) && idp.value.name === "cie") {
    yield* put(itwRequirementsRequest.success(true));
  } else {
    const hasNFCFeature = yield* call(hasNFCFeatureSelector, state);
    const hasApiLevelSupport = yield* call(hasApiLevelSupportSelector, state);
    if (
      pot.isSome(hasNFCFeature) &&
      pot.isSome(hasApiLevelSupport) &&
      hasNFCFeature.value &&
      hasApiLevelSupport.value
    ) {
      yield* put(itwRequirementsRequest.success(true));
    } else {
      yield* put(itwRequirementsRequest.failure({ code: "NFC_NOT_SUPPORTED" }));
    }
  }
}
