import { SagaIterator } from "redux-saga";
import { put, select, takeLatest } from "typed-redux-saga/macro";
import {
  fimsAcceptConsentsAction,
  fimsCancelOrAbortAction,
  fimsGetConsentsListAction,
  fimsSignAndRetrieveInAppBrowserUrlAction
} from "../store/actions";
import {
  fimsCtaTextSelector,
  fimsRelyingPartyUrlIfFastLoginSelector,
  fimsEphemeralSessionOniOSSelector
} from "../store/selectors";
import { handleFimsAbortOrCancel } from "./handleFimsAbortOrCancel";
import { handleFimsGetConsentsList } from "./handleFimsGetConsentsList";
import { handleFimsAuthorizationOrImplicitCodeFlow } from "./handleFimsAuthorizationOrImplicitCodeFlow";
import { handleFimsAcceptedConsents } from "./handleFIMSAcceptedConsents";

export function* watchFimsSSOSaga(): SagaIterator {
  yield* takeLatest(
    fimsGetConsentsListAction.request,
    handleFimsGetConsentsList
  );
  yield* takeLatest(fimsAcceptConsentsAction, handleFimsAcceptedConsents);
  yield* takeLatest(
    fimsSignAndRetrieveInAppBrowserUrlAction.request,
    handleFimsAuthorizationOrImplicitCodeFlow
  );
  yield* takeLatest(fimsCancelOrAbortAction, handleFimsAbortOrCancel);

  const fimsCtaText = yield* select(fimsCtaTextSelector);
  const fimsRelyingPartyUrl = yield* select(
    fimsRelyingPartyUrlIfFastLoginSelector
  );
  if (fimsCtaText && fimsRelyingPartyUrl) {
    const ephemeralSessionOniOS = yield* select(
      fimsEphemeralSessionOniOSSelector
    );
    yield* put(
      fimsGetConsentsListAction.request({
        ctaText: fimsCtaText,
        ctaUrl: fimsRelyingPartyUrl,
        ephemeralSessionOniOS
      })
    );
  }
}
