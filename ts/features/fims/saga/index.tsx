import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga";
import {
  fimsCancelOrAbortAction,
  fimsGetConsentsListAction,
  fimsGetRedirectUrlAndOpenIABAction
} from "../store/actions";
import { handleFimsGetConsentsList } from "./handleFimsGetConsentsList";
import { handleFimsGetRedirectUrlAndOpenIAB } from "./handleFimsGetRedirectUrlAndOpenIAB";
import { handleFimsAbortOrCancel } from "./handleFimsAbortOrCancel";

export function* watchFimsSaga(): SagaIterator {
  yield* takeLatest(
    fimsGetConsentsListAction.request,
    handleFimsGetConsentsList
  );
  yield* takeLatest(
    fimsGetRedirectUrlAndOpenIABAction.request,
    handleFimsGetRedirectUrlAndOpenIAB
  );
  yield* takeLatest(fimsCancelOrAbortAction, handleFimsAbortOrCancel);
}
