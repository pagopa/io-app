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
 * This saga handles the requirements check for the IT Wallet activation.
 * Currently it checks if the user logged in with CIE or if the device has NFC support.
 */
export function* handleRequirementsRequest(): SagaIterator {
  const idp = yield* select(idpSelector);
  if (isSome(idp) && idp.value.name === "cie") {
    yield* put(itwRequirementsRequest.success(true));
  } else {
    const hasNFCFeature = yield* select(hasNFCFeatureSelector);
    const hasApiLevelSupport = yield* select(hasApiLevelSupportSelector);
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
