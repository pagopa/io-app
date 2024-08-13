import { SagaIterator } from "redux-saga";
import { put, select, takeLatest } from "typed-redux-saga/macro";
import {
  fimsCancelOrAbortAction,
  fimsGetConsentsListAction,
  fimsGetRedirectUrlAndOpenIABAction
} from "../store/actions";
import { fimsRelyingPartyUrlIfFastLoginSelector } from "../store/selectors";
import { handleFimsAbortOrCancel } from "./handleFimsAbortOrCancel";
import { handleFimsGetConsentsList } from "./handleFimsGetConsentsList";
import { handleFimsGetRedirectUrlAndOpenIAB } from "./handleFimsGetRedirectUrlAndOpenIAB";

export function* watchFimsSSOSaga(): SagaIterator {
  yield* takeLatest(
    fimsGetConsentsListAction.request,
    handleFimsGetConsentsList
  );
  yield* takeLatest(
    fimsGetRedirectUrlAndOpenIABAction.request,
    handleFimsGetRedirectUrlAndOpenIAB
  );
  yield* takeLatest(fimsCancelOrAbortAction, handleFimsAbortOrCancel);

  const fimsRelyingPartyUrl = yield* select(
    fimsRelyingPartyUrlIfFastLoginSelector
  );
  if (fimsRelyingPartyUrl) {
    yield* put(
      fimsGetConsentsListAction.request({ ctaUrl: fimsRelyingPartyUrl })
    );
  }
}
